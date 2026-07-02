import { z } from "zod";

export const CreateCouponCodeResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
	data: z.object({
	"@entity": z.literal("org.quicko.qpon.coupon_code").optional(),
	coupon_code_id: z.string().optional(),
	code: z.string().optional(),
	description: z.string().optional(),
	customer_constraint: z.string().optional(),
	max_redemptions: z.number().optional(),
	minimum_amount: z.number().optional(),
	max_redemption_per_customer: z.number().optional(),
	visibility: z.string().optional(),
	duration_type: z.string().optional(),
	expires_at: z.string().datetime({
	offset: true,
}).optional(),
	redemption_count: z.number().optional(),
	status: z.string().optional(),
	created_at: z.string().datetime({
	offset: true,
}).optional(),
	updated_at: z.string().datetime({
	offset: true,
}).optional(),
}).optional(),
});

export type CreateCouponCodeResponse = z.infer<typeof CreateCouponCodeResponseSchema>;
