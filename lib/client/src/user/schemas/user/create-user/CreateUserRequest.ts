import { z } from "zod";

export const CreateUserRequestSchema = z.object({
	"@entity": z.literal("org.quicko.qpon.user"),
	name: z.string(),
	email: z.string(),
	password: z.string(),
	role: z.string(),
});

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
