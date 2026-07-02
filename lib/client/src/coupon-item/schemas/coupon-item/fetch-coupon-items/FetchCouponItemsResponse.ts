import { z } from "zod";

export const FetchCouponItemsResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
	data: z.object({
	"@entity": z.literal("org.quicko.qpon.coupon_item").optional(),
	coupon_id: z.string().optional(),
	items: z.array(z.object({
	"@entity": z.literal("org.quicko.qpon.item").optional(),
	item_id: z.string().optional(),
	name: z.string().optional(),
	description: z.string().optional(),
	custom_fields: z.object({}).optional(),
	external_id: z.string().optional(),
	created_at: z.string().datetime({
	offset: true,
}).optional(),
	updated_at: z.string().datetime({
	offset: true,
}).optional(),
})).optional(),
}).optional(),
});

export type FetchCouponItemsResponse = z.infer<typeof FetchCouponItemsResponseSchema>;
