import { z } from "zod";

export const ReactivateCouponCodeRequestSchema = z.object({});

export type ReactivateCouponCodeRequest = z.infer<typeof ReactivateCouponCodeRequestSchema>;
