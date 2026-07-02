/**
 * FetchOrganization404OrganizationNotFoundError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { FetchOrganizationHttp404ErrorBody } from "../../../schemas/organization/fetch-organization/FetchOrganizationHttp404ErrorBody";

export class FetchOrganization404OrganizationNotFoundError extends ApiError<FetchOrganizationHttp404ErrorBody> {
	constructor(body: FetchOrganizationHttp404ErrorBody, rawResponse?: unknown) {
		super({
			message: "FetchOrganization404OrganizationNotFoundError",
			statusCode: 404,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
