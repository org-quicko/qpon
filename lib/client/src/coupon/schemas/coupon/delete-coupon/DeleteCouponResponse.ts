import { z } from "zod";

export const DeleteCouponResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type DeleteCouponResponse = z.infer<typeof DeleteCouponResponseSchema>;
