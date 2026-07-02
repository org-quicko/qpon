import { z } from "zod";

export const CreateCouponCodeRequestSchema = z.object({
	"@entity": z.literal("org.quicko.qpon.coupon_code"),
	code: z.string().optional(),
	visibility: z.string().optional(),
	duration_type: z.string().optional(),
	expires_at: z.string().datetime({
	offset: true,
}).optional(),
	customer_constraint: z.string().optional(),
	max_redemptions: z.number().optional(),
});

export type CreateCouponCodeRequest = z.infer<typeof CreateCouponCodeRequestSchema>;
