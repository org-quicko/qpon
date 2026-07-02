/**
 * FetchUser404UserNotFoundError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { FetchUserHttp404ErrorBody } from "../../../schemas/user/fetch-user/FetchUserHttp404ErrorBody";

export class FetchUser404UserNotFoundError extends ApiError<FetchUserHttp404ErrorBody> {
	constructor(body: FetchUserHttp404ErrorBody, rawResponse?: unknown) {
		super({
			message: "FetchUser404UserNotFoundError",
			statusCode: 404,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
