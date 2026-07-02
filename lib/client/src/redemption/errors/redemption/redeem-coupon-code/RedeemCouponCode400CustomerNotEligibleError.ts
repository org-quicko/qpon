/**
 * RedeemCouponCode400CustomerNotEligibleError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { RedeemCouponCodeHttp400ErrorBody } from "../../../schemas/redemption/redeem-coupon-code/RedeemCouponCodeHttp400ErrorBody";

export class RedeemCouponCode400CustomerNotEligibleError extends ApiError<RedeemCouponCodeHttp400ErrorBody> {
	constructor(body: RedeemCouponCodeHttp400ErrorBody, rawResponse?: unknown) {
		super({
			message: "RedeemCouponCode400CustomerNotEligibleError",
			statusCode: 400,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
