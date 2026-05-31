"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";
import { requireUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  invitationTokenSchema,
  createManagedUserSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  workspaceSchema,
} from "@/lib/validations/workspace";
import type { Locale } from "@/lib/i18n/config";

function getLocale(formData: FormData): Locale {
  return formData.get("locale") === "en" ? "en" : "ar";
}

export async function createWorkspaceAction(formData: FormData) {
  const locale = getLocale(formData);
  const user = await requireUser(locale);
  const parsed = workspaceSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    redirect(`/${locale}/onboarding?error=invalid`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("workspaces").insert({
    name: parsed.data.name,
    created_by: user.id,
  });

  if (error) {
    redirect(`/${locale}/onboarding?error=create`);
  }

  revalidatePath(`/${locale}/dashboard`);
  redirect(`/${locale}/dashboard`);
}

export async function updateWorkspaceAction(formData: FormData) {
  const locale = getLocale(formData);
  await requireUser(locale);
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const parsed = workspaceSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success || !workspaceId) return;

  const supabase = await createClient();
  await supabase
    .from("workspaces")
    .update({ name: parsed.data.name })
    .eq("id", workspaceId);

  revalidatePath(`/${locale}/settings`);
  redirect(`/${locale}/settings?saved=1`);
}

export async function inviteMemberAction(formData: FormData) {
  const locale = getLocale(formData);
  const user = await requireUser(locale);
  const parsed = inviteMemberSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });
  const workspaceId = String(formData.get("workspaceId") ?? "");

  if (!parsed.success || !workspaceId) {
    redirect(`/${locale}/settings?error=invite`);
  }

  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const supabase = await createClient();
  const { error } = await supabase.from("workspace_invitations").upsert(
    {
      workspace_id: workspaceId,
      email: parsed.data.email,
      role: parsed.data.role,
      token_hash: tokenHash,
      invited_by: user.id,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    },
    { onConflict: "workspace_id,email" },
  );

  if (error) {
    redirect(`/${locale}/settings?error=invite`);
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const admin = createAdminClient();
    await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/invite/accept?token=${token}`,
      data: {
        workspace_invitation: true,
      },
    });
  }

  revalidatePath(`/${locale}/settings`);
  redirect(`/${locale}/settings?invited=1`);
}

export async function acceptWorkspaceInvitationAction(formData: FormData) {
  const locale = getLocale(formData);
  await requireUser(locale);
  const parsed = invitationTokenSchema.safeParse({
    token: formData.get("token"),
  });

  if (!parsed.success) {
    redirect(`/${locale}/invite/accept?error=invalid`);
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("accept_workspace_invitation", {
    invitation_token: parsed.data.token,
  });

  if (error) {
    redirect(`/${locale}/invite/accept?error=invalid`);
  }

  revalidatePath(`/${locale}/dashboard`);
  redirect(`/${locale}/dashboard?joined=1`);
}

export async function updateMemberRoleAction(formData: FormData) {
  const locale = getLocale(formData);
  await requireUser(locale);
  const parsed = updateMemberRoleSchema.safeParse({
    memberId: formData.get("memberId"),
    role: formData.get("role"),
  });

  if (!parsed.success) return;

  const supabase = await createClient();
  const { data: currentMember } = await supabase
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("id", parsed.data.memberId)
    .maybeSingle();

  if (
    currentMember?.role === "owner" &&
    parsed.data.role !== "owner" &&
    currentMember.workspace_id
  ) {
    const { count: ownerCount } = await supabase
      .from("workspace_members")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", currentMember.workspace_id)
      .eq("role", "owner");

    if ((ownerCount ?? 0) <= 1) {
      redirect(`/${locale}/settings?error=last-owner`);
    }
  }

  await supabase
    .from("workspace_members")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.memberId);

  revalidatePath(`/${locale}/settings`);
  redirect(`/${locale}/settings?saved=1`);
}

export async function createManagedUserAction(formData: FormData) {
  const locale = getLocale(formData);
  const user = await requireUser(locale);
  const parsed = createManagedUserSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    redirect(`/${locale}/settings?error=create-user`);
  }

  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", parsed.data.workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    redirect(`/${locale}/settings?error=forbidden`);
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.fullName,
    },
  });

  if (error || !data.user) {
    redirect(`/${locale}/settings?error=create-user`);
  }

  await supabase.from("workspace_members").insert({
    workspace_id: parsed.data.workspaceId,
    user_id: data.user.id,
    role: parsed.data.role,
  });

  revalidatePath(`/${locale}/employees`);
  redirect(`/${locale}/employees?created=1`);
}

export async function updateManagedUserProfileAction(formData: FormData) {
  const locale = getLocale(formData);
  const user = await requireUser(locale);
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const memberId = String(formData.get("memberId") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!memberId || !workspaceId || !fullName) {
    redirect(`/${locale}/employees?error=invalid`);
  }

  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    redirect(`/${locale}/employees?error=forbidden`);
  }

  const admin = createAdminClient();

  const updateData: {
    user_metadata: { full_name: string };
    password?: string;
  } = {
    user_metadata: { full_name: fullName },
  };
  if (password && password.length >= 8) {
    updateData.password = password;
  }

  const { error: authError } = await admin.auth.admin.updateUserById(memberId, updateData);
  if (authError) {
    redirect(`/${locale}/employees?error=update-user`);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", memberId);

  if (profileError) {
    redirect(`/${locale}/employees?error=update-user`);
  }

  revalidatePath(`/${locale}/employees`);
  redirect(`/${locale}/employees?saved=1`);
}
