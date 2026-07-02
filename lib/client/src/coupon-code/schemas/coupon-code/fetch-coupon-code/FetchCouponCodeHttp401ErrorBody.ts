import { z } from "zod";

export const FetchCouponCodeHttp401ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type FetchCouponCodeHttp401ErrorBody = z.infer<typeof FetchCouponCodeHttp401ErrorBodySchema>;
