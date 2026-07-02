/**
 * UpdateCustomer401UnauthorizedError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { UpdateCustomerHttp401ErrorBody } from "../../../schemas/customer/update-customer/UpdateCustomerHttp401ErrorBody";

export class UpdateCustomer401UnauthorizedError extends ApiError<UpdateCustomerHttp401ErrorBody> {
	constructor(body: UpdateCustomerHttp401ErrorBody, rawResponse?: unknown) {
		super({
			message: "UpdateCustomer401UnauthorizedError",
			statusCode: 401,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
