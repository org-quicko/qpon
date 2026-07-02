import { z } from "zod";

export const FetchUserHttp404ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type FetchUserHttp404ErrorBody = z.infer<typeof FetchUserHttp404ErrorBodySchema>;
