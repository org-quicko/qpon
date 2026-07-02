/**
 * ItemClient
 * Auto-generated - DO NOT EDIT
 */
import axios, { AxiosInstance, AxiosError } from "axios";
import { ApiError } from "../errors/common/ApiError";
import { SDKInterceptors } from "../interceptors/item/interceptors";
import type { BeforeRequestInterceptor, AfterResponseInterceptor } from "../interceptors/types";
import type { FetchItemsResponse } from "../schemas/item/fetch-items/FetchItemsResponse";
import type { CreateItemRequest } from "../schemas/item/create-item/CreateItemRequest";
import type { CreateItemResponse } from "../schemas/item/create-item/CreateItemResponse";
import type { FetchItemResponse } from "../schemas/item/fetch-item/FetchItemResponse";
import type { UpdateItemRequest } from "../schemas/item/update-item/UpdateItemRequest";
import type { UpdateItemResponse } from "../schemas/item/update-item/UpdateItemResponse";
import type { DeleteItemResponse } from "../schemas/item/delete-item/DeleteItemResponse";
import type { UpsertItemRequest } from "../schemas/item/upsert-item/UpsertItemRequest";
import type { UpsertItemResponse } from "../schemas/item/upsert-item/UpsertItemResponse";

export interface ItemClientOptions {
	baseUrl: string;
	/** Bearer token */
	token?: string;
	/** API key (x-api-key) */
	apiKey?: string;
	/** API key (x-api-secret) */
	apiSecret?: string;
}

export class ItemClient {

	private readonly client: AxiosInstance;
	private readonly interceptors: SDKInterceptors;

	constructor(
		options: ItemClientOptions,
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
	 * Fetch items
	 * 
	 *
	 * @param organizationId - 
	 * @param skip - Optional page offset. Default is 0
	 * @param take - Optional page size. Default is 10
	 * @param name - Filter to find item based on name
	 * @param externalId - Filter to find item based on external id
	 * @returns Promise<FetchItemsResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchItems(organizationId: string, skip?: number, take?: number, name?: string, externalId?: string): Promise<FetchItemsResponse> {
		try {

			const query: Record<string, unknown> = {
				"skip": skip,
				"take": take,
				"name": name,
				"external_id": externalId
			};

			const response = await this.client.get(`/api/organizations/${organizationId}/items`, { params: query });
			return response.data as FetchItemsResponse;
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
	 * Create item
	 * 
	 *
	 * @param organizationId - 
	 * @param request - The request body
	 * @returns Promise<CreateItemResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async createItem(organizationId: string, request: CreateItemRequest): Promise<CreateItemResponse> {
		try {

			const response = await this.client.post(`/api/organizations/${organizationId}/items`, request);
			return response.data as CreateItemResponse;
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
	 * Fetch item
	 * 
	 *
	 * @param organizationId - 
	 * @param itemId - 
	 * @returns Promise<FetchItemResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchItem(organizationId: string, itemId: string): Promise<FetchItemResponse> {
		try {

			const response = await this.client.get(`/api/organizations/${organizationId}/items/${itemId}`);
			return response.data as FetchItemResponse;
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
	 * Update item
	 * 
	 *
	 * @param organizationId - 
	 * @param itemId - 
	 * @param request - The request body
	 * @returns Promise<UpdateItemResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async updateItem(organizationId: string, itemId: string, request: UpdateItemRequest): Promise<UpdateItemResponse> {
		try {

			const response = await this.client.patch(`/api/organizations/${organizationId}/items/${itemId}`, request);
			return response.data as UpdateItemResponse;
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
	 * Delete item
	 * 
	 *
	 * @param organizationId - 
	 * @param itemId - 
	 * @returns Promise<DeleteItemResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async deleteItem(organizationId: string, itemId: string): Promise<DeleteItemResponse> {
		try {

			const response = await this.client.delete(`/api/organizations/${organizationId}/items/${itemId}`);
			return response.data as DeleteItemResponse;
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
	 * Upsert item
	 * 
	 *
	 * @param organizationId - 
	 * @param request - The request body
	 * @returns Promise<UpsertItemResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async upsertItem(organizationId: string, request: UpsertItemRequest): Promise<UpsertItemResponse> {
		try {

			const response = await this.client.put(`/api/organizations/${organizationId}/items/upsert`, request);
			return response.data as UpsertItemResponse;
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

