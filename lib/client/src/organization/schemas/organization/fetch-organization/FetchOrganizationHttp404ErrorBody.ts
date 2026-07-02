import { z } from "zod";

export const FetchOrganizationHttp404ErrorBodySchema = z.object({
	code: z.number().int().optional(),
	message: z.string().optional(),
});

export type FetchOrganizationHttp404ErrorBody = z.infer<typeof FetchOrganizationHttp404ErrorBodySchema>;
