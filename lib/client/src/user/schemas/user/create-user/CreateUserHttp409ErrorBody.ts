import { z } from "zod";

export const CreateUserHttp409ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type CreateUserHttp409ErrorBody = z.infer<typeof CreateUserHttp409ErrorBodySchema>;
