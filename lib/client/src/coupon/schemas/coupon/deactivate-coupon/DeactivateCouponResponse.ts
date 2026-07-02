import { z } from "zod";

export const DeactivateCouponResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type DeactivateCouponResponse = z.infer<typeof DeactivateCouponResponseSchema>;
