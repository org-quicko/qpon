import { z } from "zod";

export const RedeemCouponCodeResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type RedeemCouponCodeResponse = z.infer<typeof RedeemCouponCodeResponseSchema>;
