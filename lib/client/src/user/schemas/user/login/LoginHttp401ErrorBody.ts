import { z } from "zod";

export const LoginHttp401ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type LoginHttp401ErrorBody = z.infer<typeof LoginHttp401ErrorBodySchema>;
