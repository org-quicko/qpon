/**
 * CreateApiKey404OrganizationNotFoundError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { CreateApiKeyHttp404ErrorBody } from "../../../schemas/api-key/create-api-key/CreateApiKeyHttp404ErrorBody";

export class CreateApiKey404OrganizationNotFoundError extends ApiError<CreateApiKeyHttp404ErrorBody> {
	constructor(body: CreateApiKeyHttp404ErrorBody, rawResponse?: unknown) {
		super({
			message: "CreateApiKey404OrganizationNotFoundError",
			statusCode: 404,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
