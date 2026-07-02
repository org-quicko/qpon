import { z } from "zod";

export const LoginResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
	data: z.object({
	access_token: z.string().optional(),
}).optional(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
