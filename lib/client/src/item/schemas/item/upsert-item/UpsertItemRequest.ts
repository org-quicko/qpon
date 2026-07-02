import { z } from "zod";

export const UpsertItemRequestSchema = z.object({
	"@entity": z.literal("org.quicko.qpon.item"),
	name: z.string().optional(),
	description: z.string().optional(),
	external_id: z.string().optional(),
});

export type UpsertItemRequest = z.infer<typeof UpsertItemRequestSchema>;
