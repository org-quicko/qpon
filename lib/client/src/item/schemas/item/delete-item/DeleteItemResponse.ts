import { z } from "zod";

export const DeleteItemResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type DeleteItemResponse = z.infer<typeof DeleteItemResponseSchema>;
