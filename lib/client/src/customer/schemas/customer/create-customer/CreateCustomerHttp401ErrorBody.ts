import { z } from "zod";

export const CreateCustomerHttp401ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type CreateCustomerHttp401ErrorBody = z.infer<typeof CreateCustomerHttp401ErrorBodySchema>;
