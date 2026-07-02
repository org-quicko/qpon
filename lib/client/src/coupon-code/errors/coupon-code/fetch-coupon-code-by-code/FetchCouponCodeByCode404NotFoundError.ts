/**
 * FetchCouponCodeByCode404NotFoundError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { FetchCouponCodeByCodeHttp404ErrorBody } from "../../../schemas/coupon-code/fetch-coupon-code-by-code/FetchCouponCodeByCodeHttp404ErrorBody";

export class FetchCouponCodeByCode404NotFoundError extends ApiError<FetchCouponCodeByCodeHttp404ErrorBody> {
	constructor(body: FetchCouponCodeByCodeHttp404ErrorBody, rawResponse?: unknown) {
		super({
			message: "FetchCouponCodeByCode404NotFoundError",
			statusCode: 404,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
