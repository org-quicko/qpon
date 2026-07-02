/**
 * CreateOrganization409OrganizationAlreadyExistsError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { CreateOrganizationHttp409ErrorBody } from "../../../schemas/organization/create-organization/CreateOrganizationHttp409ErrorBody";

export class CreateOrganization409OrganizationAlreadyExistsError extends ApiError<CreateOrganizationHttp409ErrorBody> {
	constructor(body: CreateOrganizationHttp409ErrorBody, rawResponse?: unknown) {
		super({
			message: "CreateOrganization409OrganizationAlreadyExistsError",
			statusCode: 409,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
