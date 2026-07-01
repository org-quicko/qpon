import { z } from "zod";

export const DeleteCouponCodeResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type DeleteCouponCodeResponse = z.infer<typeof DeleteCouponCodeResponseSchema>;
