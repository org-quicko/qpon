/**
 * CreateUser409UserAlreadyExistsError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { CreateUserHttp409ErrorBody } from "../../../schemas/user/create-user/CreateUserHttp409ErrorBody";

export class CreateUser409UserAlreadyExistsError extends ApiError<CreateUserHttp409ErrorBody> {
	constructor(body: CreateUserHttp409ErrorBody, rawResponse?: unknown) {
		super({
			message: "CreateUser409UserAlreadyExistsError",
			statusCode: 409,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
