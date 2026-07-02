import { z } from "zod";

export const DeleteCampaignResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type DeleteCampaignResponse = z.infer<typeof DeleteCampaignResponseSchema>;
