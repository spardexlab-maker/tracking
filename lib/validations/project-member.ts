import { z } from "zod";

export const projectMemberSchema = z.object({
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
});
