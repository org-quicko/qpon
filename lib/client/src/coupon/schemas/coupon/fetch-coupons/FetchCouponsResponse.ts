import { z } from "zod";

export const FetchCouponsResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
	data: z.object({
	"@entity": z.literal("org.quicko.qpon.paginated_list").optional(),
	items: z.array(z.object({
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
})).optional(),
	count: z.number().optional(),
	skip: z.number().optional(),
	take: z.number().optional(),
}).optional(),
});

export type FetchCouponsResponse = z.infer<typeof FetchCouponsResponseSchema>;
