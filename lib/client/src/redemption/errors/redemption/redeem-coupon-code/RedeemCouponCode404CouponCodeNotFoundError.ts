/**
 * RedeemCouponCode404CouponCodeNotFoundError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { RedeemCouponCodeHttp404ErrorBody } from "../../../schemas/redemption/redeem-coupon-code/RedeemCouponCodeHttp404ErrorBody";

export class RedeemCouponCode404CouponCodeNotFoundError extends ApiError<RedeemCouponCodeHttp404ErrorBody> {
	constructor(body: RedeemCouponCodeHttp404ErrorBody, rawResponse?: unknown) {
		super({
			message: "RedeemCouponCode404CouponCodeNotFoundError",
			statusCode: 404,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
