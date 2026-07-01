/**
 * Login401UnauthorizedError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { LoginHttp401ErrorBody } from "../../../schemas/user/login/LoginHttp401ErrorBody";

export class Login401UnauthorizedError extends ApiError<LoginHttp401ErrorBody> {
	constructor(body: LoginHttp401ErrorBody, rawResponse?: unknown) {
		super({
			message: "Login401UnauthorizedError",
			statusCode: 401,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
