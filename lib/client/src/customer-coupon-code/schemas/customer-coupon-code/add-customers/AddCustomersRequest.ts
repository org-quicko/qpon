import { z } from "zod";

export const AddCustomersRequestSchema = z.object({
	"@entity": z.literal("org.quicko.qpon.customer_coupon_code"),
	customers: z.array(z.string()).optional(),
});

export type AddCustomersRequest = z.infer<typeof AddCustomersRequestSchema>;
