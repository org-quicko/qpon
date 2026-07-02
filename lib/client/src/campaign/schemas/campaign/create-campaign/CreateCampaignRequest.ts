import { z } from "zod";

export const CreateCampaignRequestSchema = z.object({
	"@entity": z.literal("org.quicko.qpon.campaign"),
	name: z.string().optional(),
	external_id: z.string().optional(),
});

export type CreateCampaignRequest = z.infer<typeof CreateCampaignRequestSchema>;
