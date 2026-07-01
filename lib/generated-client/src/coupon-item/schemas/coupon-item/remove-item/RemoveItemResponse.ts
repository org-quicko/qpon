import { z } from "zod";

export const RemoveItemResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type RemoveItemResponse = z.infer<typeof RemoveItemResponseSchema>;
