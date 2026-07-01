import { z } from "zod";

export const CreateOrganizationRequestSchema = z.object({
	"@entity": z.literal("org.quicko.qpon.organization"),
	name: z.string().optional(),
	external_id: z.string().optional(),
	currency: z.string().optional(),
});

export type CreateOrganizationRequest = z.infer<typeof CreateOrganizationRequestSchema>;
