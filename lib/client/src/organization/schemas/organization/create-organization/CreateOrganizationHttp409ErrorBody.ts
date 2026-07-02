import { z } from "zod";

export const CreateOrganizationHttp409ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type CreateOrganizationHttp409ErrorBody = z.infer<typeof CreateOrganizationHttp409ErrorBodySchema>;
