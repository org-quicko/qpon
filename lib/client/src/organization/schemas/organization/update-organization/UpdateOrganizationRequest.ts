import { z } from "zod";

export const UpdateOrganizationRequestSchema = z.object({
	"@entity": z.literal("org.quicko.qpon.organization"),
	name: z.string().optional(),
	external_id: z.string().optional(),
	currency: z.string().optional(),
});

export type UpdateOrganizationRequest = z.infer<typeof UpdateOrganizationRequestSchema>;
