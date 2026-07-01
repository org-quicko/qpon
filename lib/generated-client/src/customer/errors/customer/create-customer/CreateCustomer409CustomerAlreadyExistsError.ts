/**
 * CreateCustomer409CustomerAlreadyExistsError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { CreateCustomerHttp409ErrorBody } from "../../../schemas/customer/create-customer/CreateCustomerHttp409ErrorBody";

export class CreateCustomer409CustomerAlreadyExistsError extends ApiError<CreateCustomerHttp409ErrorBody> {
	constructor(body: CreateCustomerHttp409ErrorBody, rawResponse?: unknown) {
		super({
			message: "CreateCustomer409CustomerAlreadyExistsError",
			statusCode: 409,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
