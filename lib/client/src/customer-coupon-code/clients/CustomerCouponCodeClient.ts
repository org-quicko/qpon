/**
 * CustomerCouponCodeClient
 * Auto-generated - DO NOT EDIT
 */
import axios, { AxiosInstance, AxiosError } from "axios";
import { ApiError } from "../errors/common/ApiError";
import { AddCustomers400InvalidCustomerError } from "../errors/customer-coupon-code/add-customers/AddCustomers400InvalidCustomerError";
import type { AddCustomersHttp400ErrorBody } from "../schemas/customer-coupon-code/add-customers/AddCustomersHttp400ErrorBody";
import { SDKInterceptors } from "../interceptors/customer-coupon-code/interceptors";
import type { BeforeRequestInterceptor, AfterResponseInterceptor } from "../interceptors/types";
import type { FetchCustomersForCouponCodeResponse } from "../schemas/customer-coupon-code/fetch-customers-for-coupon-code/FetchCustomersForCouponCodeResponse";
import type { AddCustomersRequest } from "../schemas/customer-coupon-code/add-customers/AddCustomersRequest";
import type { AddCustomersResponse } from "../schemas/customer-coupon-code/add-customers/AddCustomersResponse";
import type { UpdateCustomersRequest } from "../schemas/customer-coupon-code/update-customers/UpdateCustomersRequest";
import type { UpdateCustomersResponse } from "../schemas/customer-coupon-code/update-customers/UpdateCustomersResponse";
import type { DeleteCustomersResponse } from "../schemas/customer-coupon-code/delete-customers/DeleteCustomersResponse";

export interface CustomerCouponCodeClientOptions {
	baseUrl: string;
	/** Bearer token */
	token?: string;
	/** API key (x-api-key) */
	apiKey?: string;
	/** API key (x-api-secret) */
	apiSecret?: string;
}

export class CustomerCouponCodeClient {

	private readonly client: AxiosInstance;
	private readonly interceptors: SDKInterceptors;

	constructor(
		options: CustomerCouponCodeClientOptions,
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
	 * Fetch customers
	 * 
	 *
	 * @param couponId - 
	 * @param campaignId - 
	 * @param couponCodeId - 
	 * @returns Promise<FetchCustomersForCouponCodeResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchCustomersForCouponCode(couponId: string, campaignId: string, couponCodeId: string): Promise<FetchCustomersForCouponCodeResponse> {
		try {

			const response = await this.client.get(`/api/coupons/${couponId}/campaigns/${campaignId}/coupon-codes/${couponCodeId}/customers`);
			return response.data as FetchCustomersForCouponCodeResponse;
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
	 * Add customers
	 * 
	 *
	 * @param couponId - 
	 * @param campaignId - 
	 * @param couponCodeId - 
	 * @param request - The request body
	 * @returns Promise<AddCustomersResponse> - Typed response body on success
	 * @throws AddCustomers400InvalidCustomerError on 400 responses
	 * @throws ApiError on other non-2xx responses
	 */
	public async addCustomers(couponId: string, campaignId: string, couponCodeId: string, request: AddCustomersRequest): Promise<AddCustomersResponse> {
		try {

			const response = await this.client.post(`/api/coupons/${couponId}/campaigns/${campaignId}/coupon-codes/${couponCodeId}/customers`, request);
			return response.data as AddCustomersResponse;
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				switch (error.response.status) {
					case 400:
						throw new AddCustomers400InvalidCustomerError(error.response.data as AddCustomersHttp400ErrorBody, error.response);
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
	 * Update customers
	 * 
	 *
	 * @param couponId - 
	 * @param campaignId - 
	 * @param couponCodeId - 
	 * @param request - The request body
	 * @returns Promise<UpdateCustomersResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async updateCustomers(couponId: string, campaignId: string, couponCodeId: string, request: UpdateCustomersRequest): Promise<UpdateCustomersResponse> {
		try {

			const response = await this.client.patch(`/api/coupons/${couponId}/campaigns/${campaignId}/coupon-codes/${couponCodeId}/customers`, request);
			return response.data as UpdateCustomersResponse;
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
	 * Delete customers
	 * 
	 *
	 * @param couponId - 
	 * @param campaignId - 
	 * @param couponCodeId - 
	 * @param customerId - 
	 * @returns Promise<DeleteCustomersResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async deleteCustomers(couponId: string, campaignId: string, couponCodeId: string, customerId: string): Promise<DeleteCustomersResponse> {
		try {

			const response = await this.client.delete(`/api/coupons/${couponId}/campaigns/${campaignId}/coupon-codes/${couponCodeId}/customers/${customerId}`);
			return response.data as DeleteCustomersResponse;
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

