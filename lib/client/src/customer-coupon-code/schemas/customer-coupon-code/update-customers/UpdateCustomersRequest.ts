import { z } from "zod";

export const UpdateCustomersRequestSchema = z.object({
	"@entity": z.literal("org.quicko.qpon.customer_coupon_code"),
	customers: z.array(z.string()).optional(),
});

export type UpdateCustomersRequest = z.infer<typeof UpdateCustomersRequestSchema>;
