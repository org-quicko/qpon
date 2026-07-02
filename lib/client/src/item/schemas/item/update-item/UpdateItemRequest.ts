import { z } from "zod";

export const UpdateItemRequestSchema = z.any();

export type UpdateItemRequest = z.infer<typeof UpdateItemRequestSchema>;
