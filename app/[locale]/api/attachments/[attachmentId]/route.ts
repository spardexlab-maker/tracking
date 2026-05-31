import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ attachmentId: string }> },
) {
  const { attachmentId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: attachment } = await supabase
    .from("task_attachments")
    .select("object_path")
    .eq("id", attachmentId)
    .maybeSingle();

  if (!attachment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from("task-attachments")
    .createSignedUrl(attachment.object_path, 60);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Unable to sign file" }, { status: 400 });
  }

  return NextResponse.redirect(data.signedUrl);
}
