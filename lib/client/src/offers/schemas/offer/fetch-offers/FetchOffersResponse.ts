import { z } from "zod";

export const FetchOffersResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
	data: z.object({
	metadata: z.object({}).optional(),
	sheets: z.array(z.object({
	blocks: z.array(z.object({
	header: z.array(z.string()).optional(),
	rows: z.array(z.array(z.any())).optional(),
	name: z.string().optional(),
	"@entity": z.string().optional(),
})).optional(),
	name: z.string().optional(),
	"@entity": z.string().optional(),
})).optional(),
	name: z.string().optional(),
	"@entity": z.string().optional(),
}).optional(),
});

export type FetchOffersResponse = z.infer<typeof FetchOffersResponseSchema>;
