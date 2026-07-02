import { z } from "zod";

export const UpdateUserRoleInOrganizationResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type UpdateUserRoleInOrganizationResponse = z.infer<typeof UpdateUserRoleInOrganizationResponseSchema>;
