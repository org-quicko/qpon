import { z } from "zod";

export const CreateCustomerRequestSchema = z.object({
	"@entity": z.literal("org.quicko.qpon.customer"),
	name: z.string().optional(),
	email: z.string().optional(),
	isd_code: z.string().optional(),
	phone: z.string().optional(),
	external_id: z.string().optional(),
});

export type CreateCustomerRequest = z.infer<typeof CreateCustomerRequestSchema>;
