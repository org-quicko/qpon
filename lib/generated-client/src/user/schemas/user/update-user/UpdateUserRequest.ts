import { z } from "zod";

export const UpdateUserRequestSchema = z.object({
	"@entity": z.literal("org.quicko.qpon.user"),
	name: z.string().optional(),
	email: z.string().optional(),
});

export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
