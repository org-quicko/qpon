/**
 * FetchCouponCode404CouponCodeNotFoundError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { FetchCouponCodeHttp404ErrorBody } from "../../../schemas/coupon-code/fetch-coupon-code/FetchCouponCodeHttp404ErrorBody";

export class FetchCouponCode404CouponCodeNotFoundError extends ApiError<FetchCouponCodeHttp404ErrorBody> {
	constructor(body: FetchCouponCodeHttp404ErrorBody, rawResponse?: unknown) {
		super({
			message: "FetchCouponCode404CouponCodeNotFoundError",
			statusCode: 404,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
