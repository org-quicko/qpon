/**
 * CustomerClient
 * Auto-generated - DO NOT EDIT
 */
import axios, { AxiosInstance, AxiosError } from "axios";
import { ApiError } from "../errors/common/ApiError";
import { CreateCustomer401UnauthorizedError } from "../errors/customer/create-customer/CreateCustomer401UnauthorizedError";
import { CreateCustomer409CustomerAlreadyExistsError } from "../errors/customer/create-customer/CreateCustomer409CustomerAlreadyExistsError";
import { UpdateCustomer401UnauthorizedError } from "../errors/customer/update-customer/UpdateCustomer401UnauthorizedError";
import type { CreateCustomerHttp401ErrorBody } from "../schemas/customer/create-customer/CreateCustomerHttp401ErrorBody";
import type { CreateCustomerHttp409ErrorBody } from "../schemas/customer/create-customer/CreateCustomerHttp409ErrorBody";
import type { UpdateCustomerHttp401ErrorBody } from "../schemas/customer/update-customer/UpdateCustomerHttp401ErrorBody";
import { SDKInterceptors } from "../interceptors/customer/interceptors";
import type { BeforeRequestInterceptor, AfterResponseInterceptor } from "../interceptors/types";
import type { FetchCustomersResponse } from "../schemas/customer/fetch-customers/FetchCustomersResponse";
import type { CreateCustomerRequest } from "../schemas/customer/create-customer/CreateCustomerRequest";
import type { CreateCustomerResponse } from "../schemas/customer/create-customer/CreateCustomerResponse";
import type { FetchCustomerResponse } from "../schemas/customer/fetch-customer/FetchCustomerResponse";
import type { UpdateCustomerRequest } from "../schemas/customer/update-customer/UpdateCustomerRequest";
import type { UpdateCustomerResponse } from "../schemas/customer/update-customer/UpdateCustomerResponse";
import type { DeleteCustomerResponse } from "../schemas/customer/delete-customer/DeleteCustomerResponse";
import type { UpsertCustomerRequest } from "../schemas/customer/upsert-customer/UpsertCustomerRequest";
import type { UpsertCustomerResponse } from "../schemas/customer/upsert-customer/UpsertCustomerResponse";

export interface CustomerClientOptions {
	baseUrl: string;
	/** Bearer token */
	token?: string;
	/** API key (x-api-key) */
	apiKey?: string;
	/** API key (x-api-secret) */
	apiSecret?: string;
}

export class CustomerClient {

	private readonly client: AxiosInstance;
	private readonly interceptors: SDKInterceptors;

	constructor(
		options: CustomerClientOptions,
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
	 * @param organizationId - 
	 * @param skip - Optional page offset. Default is 0
	 * @param take - Optional page size. Default is 10
	 * @param email - 
	 * @returns Promise<FetchCustomersResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchCustomers(organizationId: any, skip?: any, take?: any, email?: any): Promise<FetchCustomersResponse> {
		try {

			const query: Record<string, unknown> = {
				"skip": skip,
				"take": take,
				"email": email
			};

			const response = await this.client.get(`/api/organizations/${organizationId}/customers`, { params: query });
			return response.data as FetchCustomersResponse;
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
	 * Create customer
	 * 
	 *
	 * @param organizationId - 
	 * @param request - The request body
	 * @returns Promise<CreateCustomerResponse> - Typed response body on success
	 * @throws CreateCustomer401UnauthorizedError on 401 responses
	 * @throws CreateCustomer409CustomerAlreadyExistsError on 409 responses
	 * @throws ApiError on other non-2xx responses
	 */
	public async createCustomer(organizationId: any, request: CreateCustomerRequest): Promise<CreateCustomerResponse> {
		try {

			const response = await this.client.post(`/api/organizations/${organizationId}/customers`, request);
			return response.data as CreateCustomerResponse;
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				switch (error.response.status) {
					case 401:
						throw new CreateCustomer401UnauthorizedError(error.response.data as CreateCustomerHttp401ErrorBody, error.response);
					case 409:
						throw new CreateCustomer409CustomerAlreadyExistsError(error.response.data as CreateCustomerHttp409ErrorBody, error.response);
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
	 * Fetch customer
	 * 
	 *
	 * @param organizationId - 
	 * @param customerId - 
	 * @param skip - Optional page offset. Default is 0
	 * @param take - Optional page size. Default is 10
	 * @returns Promise<FetchCustomerResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchCustomer(organizationId: any, customerId: any, skip?: any, take?: any): Promise<FetchCustomerResponse> {
		try {

			const query: Record<string, unknown> = {
				"skip": skip,
				"take": take
			};

			const response = await this.client.get(`/api/organizations/${organizationId}/customers/${customerId}`, { params: query });
			return response.data as FetchCustomerResponse;
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
	 * Update customer
	 * 
	 *
	 * @param organizationId - 
	 * @param customerId - 
	 * @param request - The request body
	 * @returns Promise<UpdateCustomerResponse> - Typed response body on success
	 * @throws UpdateCustomer401UnauthorizedError on 401 responses
	 * @throws ApiError on other non-2xx responses
	 */
	public async updateCustomer(organizationId: any, customerId: any, request: UpdateCustomerRequest): Promise<UpdateCustomerResponse> {
		try {

			const response = await this.client.patch(`/api/organizations/${organizationId}/customers/${customerId}`, request);
			return response.data as UpdateCustomerResponse;
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				switch (error.response.status) {
					case 401:
						throw new UpdateCustomer401UnauthorizedError(error.response.data as UpdateCustomerHttp401ErrorBody, error.response);
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
	 * Delete customer
	 * 
	 *
	 * @param organizationId - 
	 * @param customerId - 
	 * @returns Promise<DeleteCustomerResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async deleteCustomer(organizationId: any, customerId: any): Promise<DeleteCustomerResponse> {
		try {

			const response = await this.client.delete(`/api/organizations/${organizationId}/customers/${customerId}`);
			return response.data as DeleteCustomerResponse;
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
	 * Upsert Customer
	 * 
	 *
	 * @param organizationId - 
	 * @param request - The request body
	 * @returns Promise<UpsertCustomerResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async upsertCustomer(organizationId: any, request: UpsertCustomerRequest): Promise<UpsertCustomerResponse> {
		try {

			const response = await this.client.put(`/api/organizations/${organizationId}/customers/upsert`, request);
			return response.data as UpsertCustomerResponse;
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

