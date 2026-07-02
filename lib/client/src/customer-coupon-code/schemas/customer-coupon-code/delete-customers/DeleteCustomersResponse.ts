import { z } from "zod";

export const DeleteCustomersResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type DeleteCustomersResponse = z.infer<typeof DeleteCustomersResponseSchema>;
