import { z } from "zod";

export const RedeemCouponCodeHttp400ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type RedeemCouponCodeHttp400ErrorBody = z.infer<typeof RedeemCouponCodeHttp400ErrorBodySchema>;
