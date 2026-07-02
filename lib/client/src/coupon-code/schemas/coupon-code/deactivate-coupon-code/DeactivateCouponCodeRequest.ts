import { z } from "zod";

export const DeactivateCouponCodeRequestSchema = z.object({});

export type DeactivateCouponCodeRequest = z.infer<typeof DeactivateCouponCodeRequestSchema>;
