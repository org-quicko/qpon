/**
 * FetchCoupon404CouponNotFoundError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { FetchCouponHttp404ErrorBody } from "../../../schemas/coupon/fetch-coupon/FetchCouponHttp404ErrorBody";

export class FetchCoupon404CouponNotFoundError extends ApiError<FetchCouponHttp404ErrorBody> {
	constructor(body: FetchCouponHttp404ErrorBody, rawResponse?: unknown) {
		super({
			message: "FetchCoupon404CouponNotFoundError",
			statusCode: 404,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
