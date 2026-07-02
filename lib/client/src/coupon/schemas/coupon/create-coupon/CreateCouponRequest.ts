import { z } from "zod";

export const CreateCouponRequestSchema = z.object({
	"@entity": z.literal("org.quicko.qpon.coupon"),
	name: z.string().optional(),
	discount_type: z.string().optional(),
	discount_value: z.number().optional(),
	item_constraint: z.string().optional(),
});

export type CreateCouponRequest = z.infer<typeof CreateCouponRequestSchema>;
