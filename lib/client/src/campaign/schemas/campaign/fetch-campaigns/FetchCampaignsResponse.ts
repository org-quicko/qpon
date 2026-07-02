import { z } from "zod";

export const FetchCampaignsResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
	data: z.object({
	"@entity": z.literal("org.quicko.qpon.paginated_list").optional(),
	items: z.array(z.object({
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
})).optional(),
	count: z.number().optional(),
	skip: z.number().optional(),
	take: z.number().optional(),
}).optional(),
});

export type FetchCampaignsResponse = z.infer<typeof FetchCampaignsResponseSchema>;
