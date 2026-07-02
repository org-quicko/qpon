import { z } from "zod";

export const FetchUsersOfAnOrganizationHttp404ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type FetchUsersOfAnOrganizationHttp404ErrorBody = z.infer<typeof FetchUsersOfAnOrganizationHttp404ErrorBodySchema>;
