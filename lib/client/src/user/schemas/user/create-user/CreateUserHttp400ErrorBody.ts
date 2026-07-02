import { z } from "zod";

export const CreateUserHttp400ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type CreateUserHttp400ErrorBody = z.infer<typeof CreateUserHttp400ErrorBodySchema>;
