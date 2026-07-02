/**
 * DeleteCoupon404CouponNotFoundError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { DeleteCouponHttp404ErrorBody } from "../../../schemas/coupon/delete-coupon/DeleteCouponHttp404ErrorBody";

export class DeleteCoupon404CouponNotFoundError extends ApiError<DeleteCouponHttp404ErrorBody> {
	constructor(body: DeleteCouponHttp404ErrorBody, rawResponse?: unknown) {
		super({
			message: "DeleteCoupon404CouponNotFoundError",
			statusCode: 404,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
