import { z } from "zod";

export const CreateCustomerHttp409ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type CreateCustomerHttp409ErrorBody = z.infer<typeof CreateCustomerHttp409ErrorBodySchema>;
