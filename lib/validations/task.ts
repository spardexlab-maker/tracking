import { z } from "zod";

export const taskSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().trim().min(1).max(220),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  statusId: z.string().uuid(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assigneeId: z.string().uuid().optional().or(z.literal("")),
  startDate: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
});

export const commentSchema = z.object({
  taskId: z.string().uuid(),
  body: z.string().trim().min(1).max(4000),
});

export const taskProgressSchema = z.object({
  taskId: z.string().uuid(),
  statusId: z.string().uuid(),
  note: z.string().trim().max(4000).optional().or(z.literal("")),
});

export const checklistItemSchema = z.object({
  taskId: z.string().uuid(),
  title: z.string().trim().min(1).max(220),
});

export const labelSchema = z.object({
  workspaceId: z.string().uuid(),
  name: z.string().trim().min(1).max(80),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});
