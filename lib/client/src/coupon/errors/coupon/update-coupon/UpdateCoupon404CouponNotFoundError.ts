/**
 * UpdateCoupon404CouponNotFoundError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { UpdateCouponHttp404ErrorBody } from "../../../schemas/coupon/update-coupon/UpdateCouponHttp404ErrorBody";

export class UpdateCoupon404CouponNotFoundError extends ApiError<UpdateCouponHttp404ErrorBody> {
	constructor(body: UpdateCouponHttp404ErrorBody, rawResponse?: unknown) {
		super({
			message: "UpdateCoupon404CouponNotFoundError",
			statusCode: 404,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
