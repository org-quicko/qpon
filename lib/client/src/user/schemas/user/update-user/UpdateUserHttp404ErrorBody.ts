import { z } from "zod";

export const UpdateUserHttp404ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type UpdateUserHttp404ErrorBody = z.infer<typeof UpdateUserHttp404ErrorBodySchema>;
