import { z } from "zod";

export const CreateSuperAdminHttp409ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type CreateSuperAdminHttp409ErrorBody = z.infer<typeof CreateSuperAdminHttp409ErrorBodySchema>;
