import { z } from "zod";

export const CreateSuperAdminRequestSchema = z.object({
	"@entity": z.literal("org.quicko.qpon.user"),
	name: z.string().optional(),
	email: z.string().optional(),
	password: z.string().optional(),
	role: z.string().optional(),
});

export type CreateSuperAdminRequest = z.infer<typeof CreateSuperAdminRequestSchema>;
