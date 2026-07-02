import { z } from "zod";

export const ReactivateCouponResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type ReactivateCouponResponse = z.infer<typeof ReactivateCouponResponseSchema>;
