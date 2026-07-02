import { z } from "zod";

export const DeleteUserResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type DeleteUserResponse = z.infer<typeof DeleteUserResponseSchema>;
