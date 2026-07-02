import { z } from "zod";

export const CreateSuperAdminResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type CreateSuperAdminResponse = z.infer<typeof CreateSuperAdminResponseSchema>;
