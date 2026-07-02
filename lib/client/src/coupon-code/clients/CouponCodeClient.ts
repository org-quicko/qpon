/**
 * CouponCodeClient
 * Auto-generated - DO NOT EDIT
 */
import axios, { AxiosInstance, AxiosError } from "axios";
import { ApiError } from "../errors/common/ApiError";
import { FetchCouponCode401UnauthorizedError } from "../errors/coupon-code/fetch-coupon-code/FetchCouponCode401UnauthorizedError";
import { FetchCouponCode404CouponCodeNotFoundError } from "../errors/coupon-code/fetch-coupon-code/FetchCouponCode404CouponCodeNotFoundError";
import { FetchCouponCodeByCode404NotFoundError } from "../errors/coupon-code/fetch-coupon-code-by-code/FetchCouponCodeByCode404NotFoundError";
import type { FetchCouponCodeHttp401ErrorBody } from "../schemas/coupon-code/fetch-coupon-code/FetchCouponCodeHttp401ErrorBody";
import type { FetchCouponCodeHttp404ErrorBody } from "../schemas/coupon-code/fetch-coupon-code/FetchCouponCodeHttp404ErrorBody";
import type { FetchCouponCodeByCodeHttp404ErrorBody } from "../schemas/coupon-code/fetch-coupon-code-by-code/FetchCouponCodeByCodeHttp404ErrorBody";
import { SDKInterceptors } from "../interceptors/coupon-code/interceptors";
import type { BeforeRequestInterceptor, AfterResponseInterceptor } from "../interceptors/types";
import type { FetchCouponCodesResponse } from "../schemas/coupon-code/fetch-coupon-codes/FetchCouponCodesResponse";
import type { CreateCouponCodeRequest } from "../schemas/coupon-code/create-coupon-code/CreateCouponCodeRequest";
import type { CreateCouponCodeResponse } from "../schemas/coupon-code/create-coupon-code/CreateCouponCodeResponse";
import type { FetchCouponCodeResponse } from "../schemas/coupon-code/fetch-coupon-code/FetchCouponCodeResponse";
import type { UpdateCouponCodeRequest } from "../schemas/coupon-code/update-coupon-code/UpdateCouponCodeRequest";
import type { UpdateCouponCodeResponse } from "../schemas/coupon-code/update-coupon-code/UpdateCouponCodeResponse";
import type { DeleteCouponCodeResponse } from "../schemas/coupon-code/delete-coupon-code/DeleteCouponCodeResponse";
import type { FetchCouponCodeByCodeResponse } from "../schemas/coupon-code/fetch-coupon-code-by-code/FetchCouponCodeByCodeResponse";
import type { DeactivateCouponCodeRequest } from "../schemas/coupon-code/deactivate-coupon-code/DeactivateCouponCodeRequest";
import type { DeactivateCouponCodeResponse } from "../schemas/coupon-code/deactivate-coupon-code/DeactivateCouponCodeResponse";
import type { ReactivateCouponCodeRequest } from "../schemas/coupon-code/reactivate-coupon-code/ReactivateCouponCodeRequest";
import type { ReactivateCouponCodeResponse } from "../schemas/coupon-code/reactivate-coupon-code/ReactivateCouponCodeResponse";

export interface CouponCodeClientOptions {
	baseUrl: string;
	/** Bearer token */
	token?: string;
	/** API key (x-api-key) */
	apiKey?: string;
	/** API key (x-api-secret) */
	apiSecret?: string;
}

export class CouponCodeClient {

	private readonly client: AxiosInstance;
	private readonly interceptors: SDKInterceptors;

	constructor(
		options: CouponCodeClientOptions,
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
	 * Fetch coupon codes
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - Coupon id
	 * @param campaignId - Campaign id
	 * @param status - Filter to get coupon codes by specified status
	 * @param visibility - Filter to get coupon codes as per specified visibility
	 * @param externalCustomerId - Filter to get customer specific coupon codes
	 * @param take - Optional page size. Default is 10
	 * @param skip - Optional page offset. Default is 0
	 * @returns Promise<FetchCouponCodesResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchCouponCodes(organizationId: string, couponId: string, campaignId: string, status?: "active" | "inactive", visibility?: "public" | "private", externalCustomerId?: string, take?: number, skip?: number): Promise<FetchCouponCodesResponse> {
		try {

			const query: Record<string, unknown> = {
				"status": status,
				"visibility": visibility,
				"external_customer_id": externalCustomerId,
				"take": take,
				"skip": skip
			};

			const response = await this.client.get(`/api/organizations/${organizationId}/coupons/${couponId}/campaigns/${campaignId}/coupon-codes`, { params: query });
			return response.data as FetchCouponCodesResponse;
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
	 * Create coupon code
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - Coupon id
	 * @param campaignId - Campaign id
	 * @param request - The request body
	 * @returns Promise<CreateCouponCodeResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async createCouponCode(organizationId: string, couponId: string, campaignId: string, request: CreateCouponCodeRequest): Promise<CreateCouponCodeResponse> {
		try {

			const response = await this.client.post(`/api/organizations/${organizationId}/coupons/${couponId}/campaigns/${campaignId}/coupon-codes`, request);
			return response.data as CreateCouponCodeResponse;
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
	 * Fetch coupon code
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - Coupon id
	 * @param campaignId - Coupon set id
	 * @param couponCodeId - Coupon code id
	 * @returns Promise<FetchCouponCodeResponse> - Typed response body on success
	 * @throws FetchCouponCode401UnauthorizedError on 401 responses
	 * @throws FetchCouponCode404CouponCodeNotFoundError on 404 responses
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchCouponCode(organizationId: any, couponId: any, campaignId: any, couponCodeId: any): Promise<FetchCouponCodeResponse> {
		try {

			const response = await this.client.get(`/api/organizations/${organizationId}/coupons/${couponId}/campaigns/${campaignId}/coupon-codes/${couponCodeId}`);
			return response.data as FetchCouponCodeResponse;
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				switch (error.response.status) {
					case 401:
						throw new FetchCouponCode401UnauthorizedError(error.response.data as FetchCouponCodeHttp401ErrorBody, error.response);
					case 404:
						throw new FetchCouponCode404CouponCodeNotFoundError(error.response.data as FetchCouponCodeHttp404ErrorBody, error.response);
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
	 * Update coupon code
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - Coupon id
	 * @param campaignId - Coupon set id
	 * @param couponCodeId - Coupon code id
	 * @param request - The request body
	 * @returns Promise<UpdateCouponCodeResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async updateCouponCode(organizationId: any, couponId: any, campaignId: any, couponCodeId: any, request: UpdateCouponCodeRequest): Promise<UpdateCouponCodeResponse> {
		try {

			const response = await this.client.patch(`/api/organizations/${organizationId}/coupons/${couponId}/campaigns/${campaignId}/coupon-codes/${couponCodeId}`, request);
			return response.data as UpdateCouponCodeResponse;
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
	 * Delete coupon code
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - Coupon id
	 * @param campaignId - Coupon set id
	 * @param couponCodeId - Coupon code id
	 * @returns Promise<DeleteCouponCodeResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async deleteCouponCode(organizationId: any, couponId: any, campaignId: any, couponCodeId: any): Promise<DeleteCouponCodeResponse> {
		try {

			const response = await this.client.delete(`/api/organizations/${organizationId}/coupons/${couponId}/campaigns/${campaignId}/coupon-codes/${couponCodeId}`);
			return response.data as DeleteCouponCodeResponse;
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
	 * Fetch coupon code by code
	 * 
	 *
	 * @param organizationId - 
	 * @param code - Filter to get coupon codes by specified code
	 * @param status - Filter to get coupon codes by specified status
	 * @param customerId - Filter to get customer specific coupon codes
	 * @param take - Optional page size. Default is 10
	 * @param skip - Optional page offset. Default is 0
	 * @param acceptType - To get response in paginated list format
	 * @returns Promise<FetchCouponCodeByCodeResponse> - Typed response body on success
	 * @throws FetchCouponCodeByCode404NotFoundError on 404 responses
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchCouponCodeByCode(organizationId: string, code?: string, status?: string, customerId?: string, take?: number, skip?: number, acceptType?: string): Promise<FetchCouponCodeByCodeResponse> {
		try {

			const headers: Record<string, string> = {};
			if (acceptType !== undefined) {
				headers["x-accept-type"] = acceptType;
			}

			const query: Record<string, unknown> = {
				"code": code,
				"status": status,
				"customer_id": customerId,
				"take": take,
				"skip": skip
			};

			const response = await this.client.get(`/api/organizations/${organizationId}/coupon-codes`, { params: query, headers });
			return response.data as FetchCouponCodeByCodeResponse;
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				switch (error.response.status) {
					case 404:
						throw new FetchCouponCodeByCode404NotFoundError(error.response.data as FetchCouponCodeByCodeHttp404ErrorBody, error.response);
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
	 * Deactivate coupon code
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - Coupon id
	 * @param campaignId - Coupon set id
	 * @param couponCodeId - Coupon code id
	 * @param request - The request body
	 * @returns Promise<DeactivateCouponCodeResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async deactivateCouponCode(organizationId: string, couponId: string, campaignId: string, couponCodeId: string, request: DeactivateCouponCodeRequest): Promise<DeactivateCouponCodeResponse> {
		try {

			const response = await this.client.patch(`/api/organizations/${organizationId}/coupons/${couponId}/campaigns/${campaignId}/coupon-codes/${couponCodeId}/deactivate`, request);
			return response.data as DeactivateCouponCodeResponse;
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
	 * Reactivate coupon code
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - Coupon id
	 * @param campaignId - Coupon set id
	 * @param couponCodeId - Coupon code id
	 * @param request - The request body
	 * @returns Promise<ReactivateCouponCodeResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async reactivateCouponCode(organizationId: string, couponId: string, campaignId: string, couponCodeId: string, request: ReactivateCouponCodeRequest): Promise<ReactivateCouponCodeResponse> {
		try {

			const response = await this.client.patch(`/api/organizations/${organizationId}/coupons/${couponId}/campaigns/${campaignId}/coupon-codes/${couponCodeId}/reactivate`, request);
			return response.data as ReactivateCouponCodeResponse;
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

