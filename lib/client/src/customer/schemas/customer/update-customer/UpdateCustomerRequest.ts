import { z } from "zod";

export const UpdateCustomerRequestSchema = z.any();

export type UpdateCustomerRequest = z.infer<typeof UpdateCustomerRequestSchema>;
