import { z } from "zod";

export const RedeemCouponCodeRequestSchema = z.object({
	"@entity": z.literal("org.quicko.qpon.redemption"),
	code: z.string().optional(),
	base_order_value: z.number().optional(),
	discount: z.number().optional(),
	external_item_id: z.string().optional(),
	external_customer_id: z.string().optional(),
});

export type RedeemCouponCodeRequest = z.infer<typeof RedeemCouponCodeRequestSchema>;
