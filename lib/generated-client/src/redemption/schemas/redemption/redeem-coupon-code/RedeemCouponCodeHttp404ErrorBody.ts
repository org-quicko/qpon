import { z } from "zod";

export const RedeemCouponCodeHttp404ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type RedeemCouponCodeHttp404ErrorBody = z.infer<typeof RedeemCouponCodeHttp404ErrorBodySchema>;
