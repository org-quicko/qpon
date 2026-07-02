import { z } from "zod";

export const UpsertCustomerRequestSchema = z.any();

export type UpsertCustomerRequest = z.infer<typeof UpsertCustomerRequestSchema>;
