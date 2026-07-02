import { z } from "zod";

export const FetchApiKeyHttp404ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type FetchApiKeyHttp404ErrorBody = z.infer<typeof FetchApiKeyHttp404ErrorBodySchema>;
