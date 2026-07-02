import { z } from "zod";

export const FetchUsersHttp404ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type FetchUsersHttp404ErrorBody = z.infer<typeof FetchUsersHttp404ErrorBodySchema>;
