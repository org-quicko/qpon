import { z } from "zod";

export const DeleteUserHttp404ErrorBodySchema = z.record(z.string(), z.any());

export type DeleteUserHttp404ErrorBody = z.infer<typeof DeleteUserHttp404ErrorBodySchema>;
