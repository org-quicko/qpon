import { z } from "zod";

export const LoginRequestSchema = z.object({
	email: z.string().optional(),
	password: z.string().optional(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
