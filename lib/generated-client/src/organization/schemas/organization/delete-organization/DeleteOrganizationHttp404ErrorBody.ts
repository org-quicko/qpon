import { z } from "zod";

export const DeleteOrganizationHttp404ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type DeleteOrganizationHttp404ErrorBody = z.infer<typeof DeleteOrganizationHttp404ErrorBodySchema>;
