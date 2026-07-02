/**
 * RedemptionClient
 * Auto-generated - DO NOT EDIT
 */
import axios, { AxiosInstance, AxiosError } from "axios";
import { ApiError } from "../errors/common/ApiError";
import { RedeemCouponCode400CustomerNotEligibleError } from "../errors/redemption/redeem-coupon-code/RedeemCouponCode400CustomerNotEligibleError";
import { RedeemCouponCode404CouponCodeNotFoundError } from "../errors/redemption/redeem-coupon-code/RedeemCouponCode404CouponCodeNotFoundError";
import { RedeemCouponCode409CustomerHasAlreadyRedeemedCouponCodeError } from "../errors/redemption/redeem-coupon-code/RedeemCouponCode409CustomerHasAlreadyRedeemedCouponCodeError";
import type { RedeemCouponCodeHttp400ErrorBody } from "../schemas/redemption/redeem-coupon-code/RedeemCouponCodeHttp400ErrorBody";
import type { RedeemCouponCodeHttp404ErrorBody } from "../schemas/redemption/redeem-coupon-code/RedeemCouponCodeHttp404ErrorBody";
import type { RedeemCouponCodeHttp409ErrorBody } from "../schemas/redemption/redeem-coupon-code/RedeemCouponCodeHttp409ErrorBody";
import { SDKInterceptors } from "../interceptors/redemption/interceptors";
import type { BeforeRequestInterceptor, AfterResponseInterceptor } from "../interceptors/types";
import type { RedeemCouponCodeRequest } from "../schemas/redemption/redeem-coupon-code/RedeemCouponCodeRequest";
import type { RedeemCouponCodeResponse } from "../schemas/redemption/redeem-coupon-code/RedeemCouponCodeResponse";
import type { FetchRedemptionsResponse } from "../schemas/redemption/fetch-redemptions/FetchRedemptionsResponse";
import type { FetchRedemptionsForCouponCodeResponse } from "../schemas/redemption/fetch-redemptions-for-coupon-code/FetchRedemptionsForCouponCodeResponse";

export interface RedemptionClientOptions {
	baseUrl: string;
	/** Bearer token */
	token?: string;
	/** API key (x-api-key) */
	apiKey?: string;
	/** API key (x-api-secret) */
	apiSecret?: string;
}

export class RedemptionClient {

	private readonly client: AxiosInstance;
	private readonly interceptors: SDKInterceptors;

	constructor(
		options: RedemptionClientOptions,
		requestInterceptors?: BeforeRequestInterceptor[],
		responseInterceptors?: AfterResponseInterceptor[],
	) {
		this.client = axios.create({ baseURL: options.baseUrl });
		this.interceptors = new SDKInterceptors();

		if (requestInterceptors) {
			this.interceptors.registerBeforeRequestInterceptors(requestInterceptors);
		}
		if (responseInterceptors) {
			this.interceptors.registerAfterResponseInterceptors(responseInterceptors);
		}

		this.client.interceptors.request.use(async (config) => {
			config.headers = config.headers ?? {};
			if (options.token) {
				config.headers["Authorization"] = "Bearer " + options.token;
			}
			if (options.apiKey) {
				config.headers["x-api-key"] = options.apiKey;
			}
			if (options.apiSecret) {
				config.headers["x-api-secret"] = options.apiSecret;
			}

			// Run registered before-request interceptors
			return this.interceptors.beforeRequest(config);
		});

		// Run registered after-response interceptors on success and error
		this.client.interceptors.response.use(
			async (response) => {
				return this.interceptors.afterResponse(response);
			},
			async (error) => {
				// Decrypt error response bodies so callers see plain data
				if (error instanceof AxiosError && error.response) {
					error.response = await this.interceptors.afterResponse(error.response);
				}
				throw error;
			},
		);
	}

	/**
	 * Redeem coupon code
	 * 
	 *
	 * @param organizationId - 
	 * @param request - The request body
	 * @returns Promise<RedeemCouponCodeResponse> - Typed response body on success
	 * @throws RedeemCouponCode400CustomerNotEligibleError on 400 responses
	 * @throws RedeemCouponCode404CouponCodeNotFoundError on 404 responses
	 * @throws RedeemCouponCode409CustomerHasAlreadyRedeemedCouponCodeError on 409 responses
	 * @throws ApiError on other non-2xx responses
	 */
	public async redeemCouponCode(organizationId: string, request: RedeemCouponCodeRequest): Promise<RedeemCouponCodeResponse> {
		try {

			const response = await this.client.post(`/api/organizations/${organizationId}/coupon-codes/redeem`, request);
			return response.data as RedeemCouponCodeResponse;
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				switch (error.response.status) {
					case 400:
						throw new RedeemCouponCode400CustomerNotEligibleError(error.response.data as RedeemCouponCodeHttp400ErrorBody, error.response);
					case 404:
						throw new RedeemCouponCode404CouponCodeNotFoundError(error.response.data as RedeemCouponCodeHttp404ErrorBody, error.response);
					case 409:
						throw new RedeemCouponCode409CustomerHasAlreadyRedeemedCouponCodeError(error.response.data as RedeemCouponCodeHttp409ErrorBody, error.response);
					default:
						throw new ApiError({
							statusCode: error.response.status,
							body: error.response.data,
							rawResponse: error.response,
						});
				}
			}
			throw error;
		}
	}

	/**
	 * Fetch redemptions
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - Filter to get redemptions for a coupon
	 * @param campaignId - Filter to get redemptions for a campaign
	 * @param couponCodeId - Filter to get redemptions for a coupon code
	 * @param customerEmail - 
	 * @param skip - Optional page offset. Default is 0
	 * @param take - Optional page size. Default is 10
	 * @param acceptType - 
	 * @returns Promise<FetchRedemptionsResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchRedemptions(organizationId: string, couponId?: string, campaignId?: string, couponCodeId?: string, customerEmail?: string, skip?: number, take?: number, acceptType?: any): Promise<FetchRedemptionsResponse> {
		try {

			const headers: Record<string, string> = {};
			if (acceptType !== undefined) {
				headers["x-accept-type"] = acceptType;
			}

			const query: Record<string, unknown> = {
				"coupon_id": couponId,
				"campaign_id": campaignId,
				"coupon_code_id": couponCodeId,
				"customer_email": customerEmail,
				"skip": skip,
				"take": take
			};

			const response = await this.client.get(`/api/organizations/${organizationId}/redemptions`, { params: query, headers });
			return response.data as FetchRedemptionsResponse;
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				throw new ApiError({
					statusCode: error.response.status,
					body: error.response.data,
					rawResponse: error.response,
				});
			}
			throw error;
		}
	}

	/**
	 * Fetch redemptions for coupon code
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - 
	 * @param campaignId - 
	 * @param couponCodeId - 
	 * @param customerEmail - 
	 * @param skip - Optional page offset. Default is 0
	 * @param take - Optional page size. Default is 10
	 * @param acceptType - 
	 * @returns Promise<FetchRedemptionsForCouponCodeResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchRedemptionsForCouponCode(organizationId: string, couponId: string, campaignId: string, couponCodeId: string, customerEmail?: string, skip?: number, take?: number, acceptType?: string): Promise<FetchRedemptionsForCouponCodeResponse> {
		try {

			const headers: Record<string, string> = {};
			if (acceptType !== undefined) {
				headers["x-accept-type"] = acceptType;
			}

			const query: Record<string, unknown> = {
				"customer_email": customerEmail,
				"skip": skip,
				"take": take
			};

			const response = await this.client.get(`/api/organizations/${organizationId}/coupons/${couponId}/campaigns/${campaignId}/coupon-codes/${couponCodeId}/redemptions`, { params: query, headers });
			return response.data as FetchRedemptionsForCouponCodeResponse;
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				throw new ApiError({
					statusCode: error.response.status,
					body: error.response.data,
					rawResponse: error.response,
				});
			}
			throw error;
		}
	}

}

