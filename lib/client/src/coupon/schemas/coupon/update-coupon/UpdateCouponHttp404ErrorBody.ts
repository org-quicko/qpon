import { z } from "zod";

export const UpdateCouponHttp404ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type UpdateCouponHttp404ErrorBody = z.infer<typeof UpdateCouponHttp404ErrorBodySchema>;
