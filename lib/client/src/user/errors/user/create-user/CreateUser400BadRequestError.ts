/**
 * CreateUser400BadRequestError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { CreateUserHttp400ErrorBody } from "../../../schemas/user/create-user/CreateUserHttp400ErrorBody";

export class CreateUser400BadRequestError extends ApiError<CreateUserHttp400ErrorBody> {
	constructor(body: CreateUserHttp400ErrorBody, rawResponse?: unknown) {
		super({
			message: "CreateUser400BadRequestError",
			statusCode: 400,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
