import { z } from "zod";

export const FetchCouponHttp404ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type FetchCouponHttp404ErrorBody = z.infer<typeof FetchCouponHttp404ErrorBodySchema>;
