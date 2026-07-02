import { z } from "zod";

export const DeactivateCampaignResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type DeactivateCampaignResponse = z.infer<typeof DeactivateCampaignResponseSchema>;
