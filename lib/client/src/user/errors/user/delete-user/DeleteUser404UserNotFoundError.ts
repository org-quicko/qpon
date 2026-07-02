/**
 * DeleteUser404UserNotFoundError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { DeleteUserHttp404ErrorBody } from "../../../schemas/user/delete-user/DeleteUserHttp404ErrorBody";

export class DeleteUser404UserNotFoundError extends ApiError<DeleteUserHttp404ErrorBody> {
	constructor(body: DeleteUserHttp404ErrorBody, rawResponse?: unknown) {
		super({
			message: "DeleteUser404UserNotFoundError",
			statusCode: 404,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
