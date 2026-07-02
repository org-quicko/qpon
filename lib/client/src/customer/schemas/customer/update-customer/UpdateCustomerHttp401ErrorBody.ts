import { z } from "zod";

export const UpdateCustomerHttp401ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type UpdateCustomerHttp401ErrorBody = z.infer<typeof UpdateCustomerHttp401ErrorBodySchema>;
