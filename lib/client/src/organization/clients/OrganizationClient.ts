/**
 * OrganizationClient
 * Auto-generated - DO NOT EDIT
 */
import axios, { AxiosInstance, AxiosError } from "axios";
import { ApiError } from "../errors/common/ApiError";
import { FetchOrganizations404OrganizationNotFoundError } from "../errors/organization/fetch-organizations/FetchOrganizations404OrganizationNotFoundError";
import { CreateOrganization400InvalidBodyError } from "../errors/organization/create-organization/CreateOrganization400InvalidBodyError";
import { CreateOrganization409OrganizationAlreadyExistsError } from "../errors/organization/create-organization/CreateOrganization409OrganizationAlreadyExistsError";
import { FetchOrganization404OrganizationNotFoundError } from "../errors/organization/fetch-organization/FetchOrganization404OrganizationNotFoundError";
import { UpdateOrganization404OrganizationNotFoundError } from "../errors/organization/update-organization/UpdateOrganization404OrganizationNotFoundError";
import { DeleteOrganization404OrganizationNotFoundError } from "../errors/organization/delete-organization/DeleteOrganization404OrganizationNotFoundError";
import type { FetchOrganizationsHttp404ErrorBody } from "../schemas/organization/fetch-organizations/FetchOrganizationsHttp404ErrorBody";
import type { CreateOrganizationHttp400ErrorBody } from "../schemas/organization/create-organization/CreateOrganizationHttp400ErrorBody";
import type { CreateOrganizationHttp409ErrorBody } from "../schemas/organization/create-organization/CreateOrganizationHttp409ErrorBody";
import type { FetchOrganizationHttp404ErrorBody } from "../schemas/organization/fetch-organization/FetchOrganizationHttp404ErrorBody";
import type { UpdateOrganizationHttp404ErrorBody } from "../schemas/organization/update-organization/UpdateOrganizationHttp404ErrorBody";
import type { DeleteOrganizationHttp404ErrorBody } from "../schemas/organization/delete-organization/DeleteOrganizationHttp404ErrorBody";
import { SDKInterceptors } from "../interceptors/organization/interceptors";
import type { BeforeRequestInterceptor, AfterResponseInterceptor } from "../interceptors/types";
import type { FetchOrganizationsResponse } from "../schemas/organization/fetch-organizations/FetchOrganizationsResponse";
import type { CreateOrganizationRequest } from "../schemas/organization/create-organization/CreateOrganizationRequest";
import type { CreateOrganizationResponse } from "../schemas/organization/create-organization/CreateOrganizationResponse";
import type { FetchOrganizationResponse } from "../schemas/organization/fetch-organization/FetchOrganizationResponse";
import type { UpdateOrganizationRequest } from "../schemas/organization/update-organization/UpdateOrganizationRequest";
import type { UpdateOrganizationResponse } from "../schemas/organization/update-organization/UpdateOrganizationResponse";
import type { DeleteOrganizationResponse } from "../schemas/organization/delete-organization/DeleteOrganizationResponse";

export interface OrganizationClientOptions {
	baseUrl: string;
	/** Bearer token */
	token?: string;
	/** API key (x-api-key) */
	apiKey?: string;
	/** API key (x-api-secret) */
	apiSecret?: string;
}

export class OrganizationClient {

	private readonly client: AxiosInstance;
	private readonly interceptors: SDKInterceptors;

	constructor(
		options: OrganizationClientOptions,
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
	 * Fetch organizations
	 * 
	 *
	 * @param externalId - Filter to get organizations by external id
	 * @param take - Optional page size. Default is 10
	 * @param skip - Optional page offset. Default is 0
	 * @param name - Filter to get organization by name
	 * @returns Promise<FetchOrganizationsResponse> - Typed response body on success
	 * @throws FetchOrganizations404OrganizationNotFoundError on 404 responses
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchOrganizations(externalId?: string, take?: number, skip?: number, name?: string): Promise<FetchOrganizationsResponse> {
		try {

			const query: Record<string, unknown> = {
				"external_id": externalId,
				"take": take,
				"skip": skip,
				"name": name
			};

			const response = await this.client.get(`/api/organizations`, { params: query });
			return response.data as FetchOrganizationsResponse;
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				switch (error.response.status) {
					case 404:
						throw new FetchOrganizations404OrganizationNotFoundError(error.response.data as FetchOrganizationsHttp404ErrorBody, error.response);
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
	 * Create organization
	 * 
	 *
	 * @param request - The request body
	 * @returns Promise<CreateOrganizationResponse> - Typed response body on success
	 * @throws CreateOrganization400InvalidBodyError on 400 responses
	 * @throws CreateOrganization409OrganizationAlreadyExistsError on 409 responses
	 * @throws ApiError on other non-2xx responses
	 */
	public async createOrganization(request: CreateOrganizationRequest): Promise<CreateOrganizationResponse> {
		try {

			const response = await this.client.post(`/api/organizations`, request);
			return response.data as CreateOrganizationResponse;
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				switch (error.response.status) {
					case 400:
						throw new CreateOrganization400InvalidBodyError(error.response.data as CreateOrganizationHttp400ErrorBody, error.response);
					case 409:
						throw new CreateOrganization409OrganizationAlreadyExistsError(error.response.data as CreateOrganizationHttp409ErrorBody, error.response);
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
	 * Fetch organization
	 * 
	 *
	 * @param organizationId - Organization id
	 * @returns Promise<FetchOrganizationResponse> - Typed response body on success
	 * @throws FetchOrganization404OrganizationNotFoundError on 404 responses
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchOrganization(organizationId: string): Promise<FetchOrganizationResponse> {
		try {

			const response = await this.client.get(`/api/organizations/${organizationId}`);
			return response.data as FetchOrganizationResponse;
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				switch (error.response.status) {
					case 404:
						throw new FetchOrganization404OrganizationNotFoundError(error.response.data as FetchOrganizationHttp404ErrorBody, error.response);
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
	 * Update organization
	 * 
	 *
	 * @param organizationId - Organization id
	 * @param request - The request body
	 * @returns Promise<UpdateOrganizationResponse> - Typed response body on success
	 * @throws UpdateOrganization404OrganizationNotFoundError on 404 responses
	 * @throws ApiError on other non-2xx responses
	 */
	public async updateOrganization(organizationId: string, request: UpdateOrganizationRequest): Promise<UpdateOrganizationResponse> {
		try {

			const response = await this.client.patch(`/api/organizations/${organizationId}`, request);
			return response.data as UpdateOrganizationResponse;
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				switch (error.response.status) {
					case 404:
						throw new UpdateOrganization404OrganizationNotFoundError(error.response.data as UpdateOrganizationHttp404ErrorBody, error.response);
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
	 * Delete organization
	 * 
	 *
	 * @param organizationId - Organization id
	 * @returns Promise<DeleteOrganizationResponse> - Typed response body on success
	 * @throws DeleteOrganization404OrganizationNotFoundError on 404 responses
	 * @throws ApiError on other non-2xx responses
	 */
	public async deleteOrganization(organizationId: string): Promise<DeleteOrganizationResponse> {
		try {

			const response = await this.client.delete(`/api/organizations/${organizationId}`);
			return response.data as DeleteOrganizationResponse;
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				switch (error.response.status) {
					case 404:
						throw new DeleteOrganization404OrganizationNotFoundError(error.response.data as DeleteOrganizationHttp404ErrorBody, error.response);
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

