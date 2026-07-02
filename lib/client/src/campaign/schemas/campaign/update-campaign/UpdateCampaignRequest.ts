import { z } from "zod";

export const UpdateCampaignRequestSchema = z.object({
	"@entity": z.literal("org.quicko.qpon.campaign"),
	budget: z.number().optional(),
});

export type UpdateCampaignRequest = z.infer<typeof UpdateCampaignRequestSchema>;
