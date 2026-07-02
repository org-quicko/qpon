/**
 * CreateOrganization400InvalidBodyError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { CreateOrganizationHttp400ErrorBody } from "../../../schemas/organization/create-organization/CreateOrganizationHttp400ErrorBody";

export class CreateOrganization400InvalidBodyError extends ApiError<CreateOrganizationHttp400ErrorBody> {
	constructor(body: CreateOrganizationHttp400ErrorBody, rawResponse?: unknown) {
		super({
			message: "CreateOrganization400InvalidBodyError",
			statusCode: 400,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
