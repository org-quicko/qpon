/**
 * ApiKeyClient
 * Auto-generated - DO NOT EDIT
 */
import axios, { AxiosInstance, AxiosError } from "axios";
import { ApiError } from "../errors/common/ApiError";
import { FetchApiKey404ApiKeyNotFoundError } from "../errors/api-key/fetch-api-key/FetchApiKey404ApiKeyNotFoundError";
import { CreateApiKey404OrganizationNotFoundError } from "../errors/api-key/create-api-key/CreateApiKey404OrganizationNotFoundError";
import type { FetchApiKeyHttp404ErrorBody } from "../schemas/api-key/fetch-api-key/FetchApiKeyHttp404ErrorBody";
import type { CreateApiKeyHttp404ErrorBody } from "../schemas/api-key/create-api-key/CreateApiKeyHttp404ErrorBody";
import { SDKInterceptors } from "../interceptors/api-key/interceptors";
import type { BeforeRequestInterceptor, AfterResponseInterceptor } from "../interceptors/types";
import type { FetchApiKeyResponse } from "../schemas/api-key/fetch-api-key/FetchApiKeyResponse";
import type { CreateApiKeyResponse } from "../schemas/api-key/create-api-key/CreateApiKeyResponse";

export interface ApiKeyClientOptions {
	baseUrl: string;
	/** Bearer token */
	token?: string;
	/** API key (x-api-key) */
	apiKey?: string;
	/** API key (x-api-secret) */
	apiSecret?: string;
}

export class ApiKeyClient {

	private readonly client: AxiosInstance;
	private readonly interceptors: SDKInterceptors;

	constructor(
		options: ApiKeyClientOptions,
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
	 * Fetch Api key
	 * 
	 *
	 * @param organizationId - 
	 * @returns Promise<FetchApiKeyResponse> - Typed response body on success
	 * @throws FetchApiKey404ApiKeyNotFoundError on 404 responses
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchApiKey(organizationId: string): Promise<FetchApiKeyResponse> {
		try {

			const response = await this.client.get(`/api/organizations/${organizationId}/api-keys`);
			return response.data as FetchApiKeyResponse;
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				switch (error.response.status) {
					case 404:
						throw new FetchApiKey404ApiKeyNotFoundError(error.response.data as FetchApiKeyHttp404ErrorBody, error.response);
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
	 * Create Api Key
	 * 
	 *
	 * @param organizationId - 
	 * @returns Promise<CreateApiKeyResponse> - Typed response body on success
	 * @throws CreateApiKey404OrganizationNotFoundError on 404 responses
	 * @throws ApiError on other non-2xx responses
	 */
	public async createApiKey(organizationId: string): Promise<CreateApiKeyResponse> {
		try {

			const response = await this.client.post(`/api/organizations/${organizationId}/api-keys`, undefined);
			return response.data as CreateApiKeyResponse;
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				switch (error.response.status) {
					case 404:
						throw new CreateApiKey404OrganizationNotFoundError(error.response.data as CreateApiKeyHttp404ErrorBody, error.response);
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

}

