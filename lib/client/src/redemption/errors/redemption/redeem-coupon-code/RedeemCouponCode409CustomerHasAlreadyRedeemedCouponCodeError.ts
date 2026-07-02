/**
 * RedeemCouponCode409CustomerHasAlreadyRedeemedCouponCodeError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { RedeemCouponCodeHttp409ErrorBody } from "../../../schemas/redemption/redeem-coupon-code/RedeemCouponCodeHttp409ErrorBody";

export class RedeemCouponCode409CustomerHasAlreadyRedeemedCouponCodeError extends ApiError<RedeemCouponCodeHttp409ErrorBody> {
	constructor(body: RedeemCouponCodeHttp409ErrorBody, rawResponse?: unknown) {
		super({
			message: "RedeemCouponCode409CustomerHasAlreadyRedeemedCouponCodeError",
			statusCode: 409,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
