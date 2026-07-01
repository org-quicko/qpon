import { z } from "zod";

export const DeactivateCouponCodeResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type DeactivateCouponCodeResponse = z.infer<typeof DeactivateCouponCodeResponseSchema>;
