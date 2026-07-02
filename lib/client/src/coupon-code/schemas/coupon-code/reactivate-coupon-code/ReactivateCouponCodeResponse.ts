import { z } from "zod";

export const ReactivateCouponCodeResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type ReactivateCouponCodeResponse = z.infer<typeof ReactivateCouponCodeResponseSchema>;
