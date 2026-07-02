/**
 * UpdateUser404UserNotFoundError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { UpdateUserHttp404ErrorBody } from "../../../schemas/user/update-user/UpdateUserHttp404ErrorBody";

export class UpdateUser404UserNotFoundError extends ApiError<UpdateUserHttp404ErrorBody> {
	constructor(body: UpdateUserHttp404ErrorBody, rawResponse?: unknown) {
		super({
			message: "UpdateUser404UserNotFoundError",
			statusCode: 404,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
