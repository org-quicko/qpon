import { z } from "zod";

export const FetchCouponResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
	data: z.object({
	"@entity": z.literal("org.quicko.qpon.coupon").optional(),
	coupon_id: z.string().optional(),
	name: z.string().optional(),
	discount_type: z.string().optional(),
	discount_value: z.number().optional(),
	discount_upto: z.number().optional(),
	item_constraint: z.string().optional(),
	status: z.string().optional(),
	created_at: z.string().datetime({
	offset: true,
}).optional(),
	updated_at: z.string().datetime({
	offset: true,
}).optional(),
}).optional(),
});

export type FetchCouponResponse = z.infer<typeof FetchCouponResponseSchema>;
