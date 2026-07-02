/**
 * FetchCouponCode401UnauthorizedError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { FetchCouponCodeHttp401ErrorBody } from "../../../schemas/coupon-code/fetch-coupon-code/FetchCouponCodeHttp401ErrorBody";

export class FetchCouponCode401UnauthorizedError extends ApiError<FetchCouponCodeHttp401ErrorBody> {
	constructor(body: FetchCouponCodeHttp401ErrorBody, rawResponse?: unknown) {
		super({
			message: "FetchCouponCode401UnauthorizedError",
			statusCode: 401,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
