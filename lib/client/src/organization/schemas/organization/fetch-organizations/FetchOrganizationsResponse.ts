import { z } from "zod";

export const FetchOrganizationsResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
	data: z.array(z.object({
	"@entity": z.literal("org.quicko.qpon.organization").optional(),
	organization_id: z.string().optional(),
	name: z.string().optional(),
	currency: z.string().optional(),
	external_id: z.string().optional(),
	created_at: z.string().datetime({
	offset: true,
}).optional(),
	updated_at: z.string().datetime({
	offset: true,
}).optional(),
})).optional(),
});

export type FetchOrganizationsResponse = z.infer<typeof FetchOrganizationsResponseSchema>;
