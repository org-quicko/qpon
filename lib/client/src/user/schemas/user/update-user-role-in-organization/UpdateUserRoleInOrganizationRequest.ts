import { z } from "zod";

export const UpdateUserRoleInOrganizationRequestSchema = z.any();

export type UpdateUserRoleInOrganizationRequest = z.infer<typeof UpdateUserRoleInOrganizationRequestSchema>;
