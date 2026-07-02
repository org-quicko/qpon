import { z } from "zod";

export const CreateItemRequestSchema = z.object({
	"@entity": z.literal("org.quicko.qpon.item"),
	name: z.string().optional(),
	description: z.string().optional(),
	custom_fields: z.object({}).optional(),
	external_id: z.string().optional(),
});

export type CreateItemRequest = z.infer<typeof CreateItemRequestSchema>;
