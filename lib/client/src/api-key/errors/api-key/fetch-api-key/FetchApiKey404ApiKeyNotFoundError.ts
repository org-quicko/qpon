/**
 * FetchApiKey404ApiKeyNotFoundError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { FetchApiKeyHttp404ErrorBody } from "../../../schemas/api-key/fetch-api-key/FetchApiKeyHttp404ErrorBody";

export class FetchApiKey404ApiKeyNotFoundError extends ApiError<FetchApiKeyHttp404ErrorBody> {
	constructor(body: FetchApiKeyHttp404ErrorBody, rawResponse?: unknown) {
		super({
			message: "FetchApiKey404ApiKeyNotFoundError",
			statusCode: 404,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
