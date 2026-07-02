/**
 * CreateCustomer401UnauthorizedError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { CreateCustomerHttp401ErrorBody } from "../../../schemas/customer/create-customer/CreateCustomerHttp401ErrorBody";

export class CreateCustomer401UnauthorizedError extends ApiError<CreateCustomerHttp401ErrorBody> {
	constructor(body: CreateCustomerHttp401ErrorBody, rawResponse?: unknown) {
		super({
			message: "CreateCustomer401UnauthorizedError",
			statusCode: 401,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
