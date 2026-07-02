import { z } from "zod";

export const AddCustomersHttp400ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type AddCustomersHttp400ErrorBody = z.infer<typeof AddCustomersHttp400ErrorBodySchema>;
