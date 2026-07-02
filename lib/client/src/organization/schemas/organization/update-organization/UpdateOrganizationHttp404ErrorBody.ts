import { z } from "zod";

export const UpdateOrganizationHttp404ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type UpdateOrganizationHttp404ErrorBody = z.infer<typeof UpdateOrganizationHttp404ErrorBodySchema>;
