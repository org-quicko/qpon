import { z } from "zod";

export const FetchCouponCodeByCodeHttp404ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type FetchCouponCodeByCodeHttp404ErrorBody = z.infer<typeof FetchCouponCodeByCodeHttp404ErrorBodySchema>;
