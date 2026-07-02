/**
 * DeleteOrganization404OrganizationNotFoundError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { DeleteOrganizationHttp404ErrorBody } from "../../../schemas/organization/delete-organization/DeleteOrganizationHttp404ErrorBody";

export class DeleteOrganization404OrganizationNotFoundError extends ApiError<DeleteOrganizationHttp404ErrorBody> {
	constructor(body: DeleteOrganizationHttp404ErrorBody, rawResponse?: unknown) {
		super({
			message: "DeleteOrganization404OrganizationNotFoundError",
			statusCode: 404,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
