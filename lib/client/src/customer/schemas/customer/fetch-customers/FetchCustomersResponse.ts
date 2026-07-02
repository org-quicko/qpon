import { z } from "zod";

export const FetchCustomersResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
	data: z.object({
	"@entity": z.literal("org.quicko.qpon.paginated_list").optional(),
	items: z.array(z.object({
	"@entity": z.literal("org.quicko.qpon.customer").optional(),
	customer_id: z.string().optional(),
	name: z.string().optional(),
	email: z.string().optional(),
	isd_code: z.string().optional(),
	phone: z.string().optional(),
	external_id: z.string().optional(),
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

export type FetchCustomersResponse = z.infer<typeof FetchCustomersResponseSchema>;
