/**
 * CouponItemClient
 * Auto-generated - DO NOT EDIT
 */
import axios, { AxiosInstance, AxiosError } from "axios";
import { ApiError } from "../errors/common/ApiError";
import { SDKInterceptors } from "../interceptors/coupon-item/interceptors";
import type { BeforeRequestInterceptor, AfterResponseInterceptor } from "../interceptors/types";
import type { FetchCouponItemsResponse } from "../schemas/coupon-item/fetch-coupon-items/FetchCouponItemsResponse";
import type { AddItemsRequest } from "../schemas/coupon-item/add-items/AddItemsRequest";
import type { AddItemsResponse } from "../schemas/coupon-item/add-items/AddItemsResponse";
import type { UpdateItemsRequest } from "../schemas/coupon-item/update-items/UpdateItemsRequest";
import type { UpdateItemsResponse } from "../schemas/coupon-item/update-items/UpdateItemsResponse";
import type { RemoveItemResponse } from "../schemas/coupon-item/remove-item/RemoveItemResponse";

export interface CouponItemClientOptions {
	baseUrl: string;
	/** Bearer token */
	token?: string;
	/** API key (x-api-key) */
	apiKey?: string;
	/** API key (x-api-secret) */
	apiSecret?: string;
}

export class CouponItemClient {

	private readonly client: AxiosInstance;
	private readonly interceptors: SDKInterceptors;

	constructor(
		options: CouponItemClientOptions,
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
	 * Fetch coupon items
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - 
	 * @param skip - 
	 * @param take - 
	 * @param name - 
	 * @returns Promise<FetchCouponItemsResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchCouponItems(organizationId: string, couponId: string, skip?: number, take?: number, name?: string): Promise<FetchCouponItemsResponse> {
		try {

			const query: Record<string, unknown> = {
				"skip": skip,
				"take": take,
				"name": name
			};

			const response = await this.client.get(`/api/organizations/${organizationId}/coupons/${couponId}/items`, { params: query });
			return response.data as FetchCouponItemsResponse;
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
	 * Add items
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - 
	 * @param request - The request body
	 * @returns Promise<AddItemsResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async addItems(organizationId: string, couponId: string, request: AddItemsRequest): Promise<AddItemsResponse> {
		try {

			const response = await this.client.post(`/api/organizations/${organizationId}/coupons/${couponId}/items`, request);
			return response.data as AddItemsResponse;
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
	 * Update items
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - 
	 * @param request - The request body
	 * @returns Promise<UpdateItemsResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async updateItems(organizationId: string, couponId: string, request: UpdateItemsRequest): Promise<UpdateItemsResponse> {
		try {

			const response = await this.client.patch(`/api/organizations/${organizationId}/coupons/${couponId}/items`, request);
			return response.data as UpdateItemsResponse;
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
	 * Remove item
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - 
	 * @param itemId - 
	 * @returns Promise<RemoveItemResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async removeItem(organizationId: string, couponId: string, itemId: string): Promise<RemoveItemResponse> {
		try {

			const response = await this.client.delete(`/api/organizations/${organizationId}/coupons/${couponId}/items/${itemId}`);
			return response.data as RemoveItemResponse;
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

