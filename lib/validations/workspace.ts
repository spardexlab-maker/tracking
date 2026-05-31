import { z } from "zod";
import { workspaceRoles } from "@/lib/permissions/roles";

export const workspaceSchema = z.object({
  name: z.string().trim().min(2).max(120),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(workspaceRoles),
});

export const invitationTokenSchema = z.object({
  token: z.string().min(20),
});

export const updateMemberRoleSchema = z.object({
  memberId: z.string().uuid(),
  role: z.enum(workspaceRoles),
});

export const createManagedUserSchema = z.object({
  workspaceId: z.string().uuid(),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(workspaceRoles),
});
