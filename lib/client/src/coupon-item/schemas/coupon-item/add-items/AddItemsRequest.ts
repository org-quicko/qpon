import { z } from "zod";

export const AddItemsRequestSchema = z.object({
	"@entity": z.literal("org.quicko.qpon.coupon_item"),
	items: z.array(z.string()).optional(),
});

export type AddItemsRequest = z.infer<typeof AddItemsRequestSchema>;
