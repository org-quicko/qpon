import { z } from "zod";

export const DeleteOrganizationResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type DeleteOrganizationResponse = z.infer<typeof DeleteOrganizationResponseSchema>;
