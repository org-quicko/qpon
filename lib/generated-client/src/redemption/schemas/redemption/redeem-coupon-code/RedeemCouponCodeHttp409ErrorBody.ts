import { z } from "zod";

export const RedeemCouponCodeHttp409ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type RedeemCouponCodeHttp409ErrorBody = z.infer<typeof RedeemCouponCodeHttp409ErrorBodySchema>;
