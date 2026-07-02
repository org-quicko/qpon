/**
 * UpdateOrganization404OrganizationNotFoundError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { UpdateOrganizationHttp404ErrorBody } from "../../../schemas/organization/update-organization/UpdateOrganizationHttp404ErrorBody";

export class UpdateOrganization404OrganizationNotFoundError extends ApiError<UpdateOrganizationHttp404ErrorBody> {
	constructor(body: UpdateOrganizationHttp404ErrorBody, rawResponse?: unknown) {
		super({
			message: "UpdateOrganization404OrganizationNotFoundError",
			statusCode: 404,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
