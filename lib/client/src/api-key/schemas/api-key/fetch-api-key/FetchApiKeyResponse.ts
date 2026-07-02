import { z } from "zod";

export const FetchApiKeyResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
	data: z.object({
	"@entity": z.literal("org.quicko.qpon.api_key").optional(),
	api_key_id: z.string().optional(),
	key: z.string().optional(),
	secret: z.string().optional(),
	created_at: z.string().datetime({
	offset: true,
}).optional(),
	updated_at: z.string().datetime({
	offset: true,
}).optional(),
}).optional(),
});

export type FetchApiKeyResponse = z.infer<typeof FetchApiKeyResponseSchema>;
