/**
 * FetchUsers404UsersNotFoundError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { FetchUsersHttp404ErrorBody } from "../../../schemas/user/fetch-users/FetchUsersHttp404ErrorBody";

export class FetchUsers404UsersNotFoundError extends ApiError<FetchUsersHttp404ErrorBody> {
	constructor(body: FetchUsersHttp404ErrorBody, rawResponse?: unknown) {
		super({
			message: "FetchUsers404UsersNotFoundError",
			statusCode: 404,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
