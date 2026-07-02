import { z } from "zod";

export const FetchCouponCodeHttp404ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type FetchCouponCodeHttp404ErrorBody = z.infer<typeof FetchCouponCodeHttp404ErrorBodySchema>;
