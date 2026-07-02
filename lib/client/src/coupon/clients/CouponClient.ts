/**
 * CouponClient
 * Auto-generated - DO NOT EDIT
 */
import axios, { AxiosInstance, AxiosError } from "axios";
import { ApiError } from "../errors/common/ApiError";
import { FetchCoupon404CouponNotFoundError } from "../errors/coupon/fetch-coupon/FetchCoupon404CouponNotFoundError";
import { UpdateCoupon404CouponNotFoundError } from "../errors/coupon/update-coupon/UpdateCoupon404CouponNotFoundError";
import { DeleteCoupon404CouponNotFoundError } from "../errors/coupon/delete-coupon/DeleteCoupon404CouponNotFoundError";
import type { FetchCouponHttp404ErrorBody } from "../schemas/coupon/fetch-coupon/FetchCouponHttp404ErrorBody";
import type { UpdateCouponHttp404ErrorBody } from "../schemas/coupon/update-coupon/UpdateCouponHttp404ErrorBody";
import type { DeleteCouponHttp404ErrorBody } from "../schemas/coupon/delete-coupon/DeleteCouponHttp404ErrorBody";
import { SDKInterceptors } from "../interceptors/coupon/interceptors";
import type { BeforeRequestInterceptor, AfterResponseInterceptor } from "../interceptors/types";
import type { FetchCouponsResponse } from "../schemas/coupon/fetch-coupons/FetchCouponsResponse";
import type { CreateCouponRequest } from "../schemas/coupon/create-coupon/CreateCouponRequest";
import type { CreateCouponResponse } from "../schemas/coupon/create-coupon/CreateCouponResponse";
import type { FetchCouponResponse } from "../schemas/coupon/fetch-coupon/FetchCouponResponse";
import type { UpdateCouponRequest } from "../schemas/coupon/update-coupon/UpdateCouponRequest";
import type { UpdateCouponResponse } from "../schemas/coupon/update-coupon/UpdateCouponResponse";
import type { DeleteCouponResponse } from "../schemas/coupon/delete-coupon/DeleteCouponResponse";
import type { DeactivateCouponResponse } from "../schemas/coupon/deactivate-coupon/DeactivateCouponResponse";
import type { ReactivateCouponResponse } from "../schemas/coupon/reactivate-coupon/ReactivateCouponResponse";
import type { FetchCouponsSummaryResponse } from "../schemas/coupon/fetch-coupons-summary/FetchCouponsSummaryResponse";
import type { FetchCouponSummaryResponse } from "../schemas/coupon/fetch-coupon-summary/FetchCouponSummaryResponse";

export interface CouponClientOptions {
	baseUrl: string;
	/** Bearer token */
	token?: string;
	/** API key (x-api-key) */
	apiKey?: string;
	/** API key (x-api-secret) */
	apiSecret?: string;
}

export class CouponClient {

	private readonly client: AxiosInstance;
	private readonly interceptors: SDKInterceptors;

	constructor(
		options: CouponClientOptions,
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
	 * Fetch coupons
	 * 
	 *
	 * @param organizationId - 
	 * @param status - Filter to get coupons by specified status
	 * @param discountType - Filter to get coupons by specified discount type
	 * @param externalItemId - Filter to get coupons by specified item
	 * @param name - Filter to find coupon based on name
	 * @param take - Optional page size. Default is 10
	 * @param skip - Optional page offset. Default is 0
	 * @param sortBy - Filter to sort coupons by specified field
	 * @param sortOrder - Filter to sort coupons by specified order
	 * @param itemConstraint - Filter to sort coupons by specified item constraint
	 * @returns Promise<FetchCouponsResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchCoupons(organizationId: string, status?: string, discountType?: string, externalItemId?: string, name?: string, take?: number, skip?: number, sortBy?: string, sortOrder?: "asc" | "desc", itemConstraint?: "all" | "specific"): Promise<FetchCouponsResponse> {
		try {

			const query: Record<string, unknown> = {
				"status": status,
				"discount_type": discountType,
				"external_item_id": externalItemId,
				"name": name,
				"take": take,
				"skip": skip,
				"sort_by": sortBy,
				"sort_order": sortOrder,
				"item_constraint": itemConstraint
			};

			const response = await this.client.get(`/api/organizations/${organizationId}/coupons`, { params: query });
			return response.data as FetchCouponsResponse;
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
	 * Create coupon
	 * 
	 *
	 * @param organizationId - 
	 * @param request - The request body
	 * @returns Promise<CreateCouponResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async createCoupon(organizationId: string, request: CreateCouponRequest): Promise<CreateCouponResponse> {
		try {

			const response = await this.client.post(`/api/organizations/${organizationId}/coupons`, request);
			return response.data as CreateCouponResponse;
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
	 * Fetch coupon
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - 
	 * @returns Promise<FetchCouponResponse> - Typed response body on success
	 * @throws FetchCoupon404CouponNotFoundError on 404 responses
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchCoupon(organizationId: string, couponId: string): Promise<FetchCouponResponse> {
		try {

			const response = await this.client.get(`/api/organizations/${organizationId}/coupons/${couponId}`);
			return response.data as FetchCouponResponse;
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				switch (error.response.status) {
					case 404:
						throw new FetchCoupon404CouponNotFoundError(error.response.data as FetchCouponHttp404ErrorBody, error.response);
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
	 * Update coupon
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - 
	 * @param request - The request body
	 * @returns Promise<UpdateCouponResponse> - Typed response body on success
	 * @throws UpdateCoupon404CouponNotFoundError on 404 responses
	 * @throws ApiError on other non-2xx responses
	 */
	public async updateCoupon(organizationId: string, couponId: string, request: UpdateCouponRequest): Promise<UpdateCouponResponse> {
		try {

			const response = await this.client.patch(`/api/organizations/${organizationId}/coupons/${couponId}`, request);
			return response.data as UpdateCouponResponse;
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				switch (error.response.status) {
					case 404:
						throw new UpdateCoupon404CouponNotFoundError(error.response.data as UpdateCouponHttp404ErrorBody, error.response);
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
	 * Delete coupon
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - 
	 * @returns Promise<DeleteCouponResponse> - Typed response body on success
	 * @throws DeleteCoupon404CouponNotFoundError on 404 responses
	 * @throws ApiError on other non-2xx responses
	 */
	public async deleteCoupon(organizationId: string, couponId: string): Promise<DeleteCouponResponse> {
		try {

			const response = await this.client.delete(`/api/organizations/${organizationId}/coupons/${couponId}`);
			return response.data as DeleteCouponResponse;
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				switch (error.response.status) {
					case 404:
						throw new DeleteCoupon404CouponNotFoundError(error.response.data as DeleteCouponHttp404ErrorBody, error.response);
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
	 * Deactivate coupon
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - Coupon id
	 * @returns Promise<DeactivateCouponResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async deactivateCoupon(organizationId: string, couponId: string): Promise<DeactivateCouponResponse> {
		try {

			const response = await this.client.post(`/api/organizations/${organizationId}/coupons/${couponId}/deactivate`, undefined);
			return response.data as DeactivateCouponResponse;
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
	 * Reactivate coupon
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - Coupon id
	 * @returns Promise<ReactivateCouponResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async reactivateCoupon(organizationId: any, couponId: any): Promise<ReactivateCouponResponse> {
		try {

			const response = await this.client.post(`/api/organizations/${organizationId}/coupons/${couponId}/reactivate`, undefined);
			return response.data as ReactivateCouponResponse;
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
	 * Fetch coupons summary
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - Coupon id
	 * @param take - Optional page size. Default is 10
	 * @param skip - Optional page offset. Default is 0
	 * @param acceptType - 
	 * @returns Promise<FetchCouponsSummaryResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchCouponsSummary(organizationId: string, acceptType: string, couponId?: string, take?: number, skip?: number): Promise<FetchCouponsSummaryResponse> {
		try {

			const headers: Record<string, string> = {};
			headers["x-accept-type"] = acceptType;

			const query: Record<string, unknown> = {
				"coupon_id": couponId,
				"take": take,
				"skip": skip
			};

			const response = await this.client.get(`/api/organizations/${organizationId}/coupons/summary`, { params: query, headers });
			return response.data as FetchCouponsSummaryResponse;
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
	 * Fetch coupon summary
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - 
	 * @param take - Optional page size. Default is 10
	 * @param skip - Optional page offset. Default is 0
	 * @param acceptType - 
	 * @returns Promise<FetchCouponSummaryResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchCouponSummary(organizationId: string, couponId: string, acceptType: string, take?: number, skip?: number): Promise<FetchCouponSummaryResponse> {
		try {

			const headers: Record<string, string> = {};
			headers["x-accept-type"] = acceptType;

			const query: Record<string, unknown> = {
				"take": take,
				"skip": skip
			};

			const response = await this.client.get(`/api/organizations/${organizationId}/coupons/${couponId}/summary`, { params: query, headers });
			return response.data as FetchCouponSummaryResponse;
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

