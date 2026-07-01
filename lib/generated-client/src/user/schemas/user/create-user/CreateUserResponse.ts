import { z } from "zod";

export const CreateUserResponseSchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
	data: z.object({
	"@entity": z.literal("org.quicko.qpon.user").optional(),
	user_id: z.string().optional(),
	name: z.string().optional(),
	email: z.string().optional(),
	password: z.string().optional(),
	role: z.string().optional(),
	last_accessed_at: z.string().datetime({
	offset: true,
}).optional(),
	created_at: z.string().datetime({
	offset: true,
}).optional(),
	updated_at: z.string().datetime({
	offset: true,
}).optional(),
}).optional(),
});

export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;
