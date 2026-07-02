import { z } from "zod";

export const FetchCustomersForCouponCodeResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
	data: z.object({
	"@entity": z.literal("org.quicko.qpon.customer_coupon_code").optional(),
	coupon_code_id: z.string().optional(),
	customers: z.array(z.object({
	"@entity": z.literal("org.quicko.qpon.customer").optional(),
	customer_id: z.string().optional(),
	name: z.string().optional(),
	email: z.string().optional(),
	isd_code: z.string().optional(),
	phone: z.string().optional(),
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

export type FetchCustomersForCouponCodeResponse = z.infer<typeof FetchCustomersForCouponCodeResponseSchema>;
