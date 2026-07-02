import { z } from "zod";

export const CreateOrganizationHttp400ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type CreateOrganizationHttp400ErrorBody = z.infer<typeof CreateOrganizationHttp400ErrorBodySchema>;
