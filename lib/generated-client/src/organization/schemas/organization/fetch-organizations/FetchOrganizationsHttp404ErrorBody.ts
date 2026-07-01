import { z } from "zod";

export const FetchOrganizationsHttp404ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type FetchOrganizationsHttp404ErrorBody = z.infer<typeof FetchOrganizationsHttp404ErrorBodySchema>;
