import { z } from "zod";

export const CreateApiKeyHttp404ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type CreateApiKeyHttp404ErrorBody = z.infer<typeof CreateApiKeyHttp404ErrorBodySchema>;
