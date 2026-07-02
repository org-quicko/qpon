/**
 * CreateSuperAdmin409SuperAdminAlreadyExistsError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { CreateSuperAdminHttp409ErrorBody } from "../../../schemas/user/create-super-admin/CreateSuperAdminHttp409ErrorBody";

export class CreateSuperAdmin409SuperAdminAlreadyExistsError extends ApiError<CreateSuperAdminHttp409ErrorBody> {
	constructor(body: CreateSuperAdminHttp409ErrorBody, rawResponse?: unknown) {
		super({
			message: "CreateSuperAdmin409SuperAdminAlreadyExistsError",
			statusCode: 409,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
