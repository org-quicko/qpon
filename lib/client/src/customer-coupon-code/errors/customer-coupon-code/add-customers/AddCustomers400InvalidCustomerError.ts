/**
 * AddCustomers400InvalidCustomerError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { AddCustomersHttp400ErrorBody } from "../../../schemas/customer-coupon-code/add-customers/AddCustomersHttp400ErrorBody";

export class AddCustomers400InvalidCustomerError extends ApiError<AddCustomersHttp400ErrorBody> {
	constructor(body: AddCustomersHttp400ErrorBody, rawResponse?: unknown) {
		super({
			message: "AddCustomers400InvalidCustomerError",
			statusCode: 400,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
