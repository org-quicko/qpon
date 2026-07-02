import { z } from "zod";

export const UpdateCouponRequestSchema = z.object({
	"@entity": z.literal("org.quicko.qpon.coupon"),
	item_constraint: z.string().optional(),
});

export type UpdateCouponRequest = z.infer<typeof UpdateCouponRequestSchema>;
