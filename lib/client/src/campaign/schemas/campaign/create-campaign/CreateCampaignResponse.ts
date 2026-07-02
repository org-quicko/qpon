import { z } from "zod";

export const CreateCampaignResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
	data: z.object({
	"@entity": z.literal("org.quicko.qpon.campaign").optional(),
	campaign_id: z.string().optional(),
	name: z.string().optional(),
	budget: z.number().optional(),
	external_id: z.string().optional(),
	status: z.string().optional(),
	created_at: z.string().datetime({
	offset: true,
}).optional(),
	updated_at: z.string().datetime({
	offset: true,
}).optional(),
}).optional(),
});

export type CreateCampaignResponse = z.infer<typeof CreateCampaignResponseSchema>;
