import { z } from "zod";

export const UpdateItemsRequestSchema = z.object({
	"@entity": z.literal("org.quicko.qpon.coupon_item"),
	items: z.array(z.string()).optional(),
});

export type UpdateItemsRequest = z.infer<typeof UpdateItemsRequestSchema>;
