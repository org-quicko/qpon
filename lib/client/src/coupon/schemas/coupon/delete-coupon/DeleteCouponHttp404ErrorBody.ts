import { z } from "zod";

export const DeleteCouponHttp404ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type DeleteCouponHttp404ErrorBody = z.infer<typeof DeleteCouponHttp404ErrorBodySchema>;
