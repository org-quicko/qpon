/**
 * FetchOrganizations404OrganizationNotFoundError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { FetchOrganizationsHttp404ErrorBody } from "../../../schemas/organization/fetch-organizations/FetchOrganizationsHttp404ErrorBody";

export class FetchOrganizations404OrganizationNotFoundError extends ApiError<FetchOrganizationsHttp404ErrorBody> {
	constructor(body: FetchOrganizationsHttp404ErrorBody, rawResponse?: unknown) {
		super({
			message: "FetchOrganizations404OrganizationNotFoundError",
			statusCode: 404,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
