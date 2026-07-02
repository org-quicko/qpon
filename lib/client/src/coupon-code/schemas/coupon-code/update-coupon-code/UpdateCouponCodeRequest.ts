import { z } from "zod";

export const UpdateCouponCodeRequestSchema = z.any();

export type UpdateCouponCodeRequest = z.infer<typeof UpdateCouponCodeRequestSchema>;
