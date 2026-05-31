import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().trim().min(2).max(160),
});
