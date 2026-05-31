import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  taskId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  objectPath: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string().optional(),
  fileSize: z.number().nonnegative(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { error } = await supabase.from("task_attachments").insert({
    task_id: parsed.data.taskId,
    workspace_id: parsed.data.workspaceId,
    uploaded_by: user.id,
    object_path: parsed.data.objectPath,
    file_name: parsed.data.fileName,
    mime_type: parsed.data.mimeType,
    file_size: parsed.data.fileSize,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
