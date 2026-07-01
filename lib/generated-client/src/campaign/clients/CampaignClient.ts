/**
 * CampaignClient
 * Auto-generated - DO NOT EDIT
 */
import axios, { AxiosInstance, AxiosError } from "axios";
import { ApiError } from "../errors/common/ApiError";
import { SDKInterceptors } from "../interceptors/campaign/interceptors";
import type { BeforeRequestInterceptor, AfterResponseInterceptor } from "../interceptors/types";
import type { FetchCampaignsResponse } from "../schemas/campaign/fetch-campaigns/FetchCampaignsResponse";
import type { CreateCampaignRequest } from "../schemas/campaign/create-campaign/CreateCampaignRequest";
import type { CreateCampaignResponse } from "../schemas/campaign/create-campaign/CreateCampaignResponse";
import type { FetchCampaignResponse } from "../schemas/campaign/fetch-campaign/FetchCampaignResponse";
import type { UpdateCampaignRequest } from "../schemas/campaign/update-campaign/UpdateCampaignRequest";
import type { UpdateCampaignResponse } from "../schemas/campaign/update-campaign/UpdateCampaignResponse";
import type { DeleteCampaignResponse } from "../schemas/campaign/delete-campaign/DeleteCampaignResponse";
import type { DeactivateCampaignResponse } from "../schemas/campaign/deactivate-campaign/DeactivateCampaignResponse";
import type { ReactivateCampaignResponse } from "../schemas/campaign/reactivate-campaign/ReactivateCampaignResponse";
import type { FetchCampaignsSummaryResponse } from "../schemas/campaign/fetch-campaigns-summary/FetchCampaignsSummaryResponse";
import type { FetchCampaignSummaryResponse } from "../schemas/campaign/fetch-campaign-summary/FetchCampaignSummaryResponse";

export interface CampaignClientOptions {
	baseUrl: string;
	/** Bearer token */
	token?: string;
	/** API key (x-api-key) */
	apiKey?: string;
	/** API key (x-api-secret) */
	apiSecret?: string;
}

export class CampaignClient {

	private readonly client: AxiosInstance;
	private readonly interceptors: SDKInterceptors;

	constructor(
		options: CampaignClientOptions,
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
	 * Fetch campaigns
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - Coupon id
	 * @param status - Filter to get coupon sets by specified status
	 * @param budgeted - Filter to get coupon sets with budget
	 * @param take - Optional page size. Default is 10
	 * @param skip - Optional page offset. Default is 0
	 * @returns Promise<FetchCampaignsResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchCampaigns(organizationId: string, couponId: string, status?: string, budgeted?: boolean, take?: number, skip?: number): Promise<FetchCampaignsResponse> {
		try {

			const query: Record<string, unknown> = {
				"status": status,
				"budgeted": budgeted,
				"take": take,
				"skip": skip
			};

			const response = await this.client.get(`/api/organizations/${organizationId}/coupons/${couponId}/campaigns`, { params: query });
			return response.data as FetchCampaignsResponse;
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
	 * Create campaign
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - Coupon id
	 * @param request - The request body
	 * @returns Promise<CreateCampaignResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async createCampaign(organizationId: string, couponId: string, request: CreateCampaignRequest): Promise<CreateCampaignResponse> {
		try {

			const response = await this.client.post(`/api/organizations/${organizationId}/coupons/${couponId}/campaigns`, request);
			return response.data as CreateCampaignResponse;
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
	 * Fetch campaign
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - 
	 * @param campaignId - 
	 * @returns Promise<FetchCampaignResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchCampaign(organizationId: string, couponId: string, campaignId: string): Promise<FetchCampaignResponse> {
		try {

			const response = await this.client.get(`/api/organizations/${organizationId}/coupons/${couponId}/campaigns/${campaignId}`);
			return response.data as FetchCampaignResponse;
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
	 * Update campaign
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - 
	 * @param campaignId - 
	 * @param request - The request body
	 * @returns Promise<UpdateCampaignResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async updateCampaign(organizationId: string, couponId: string, campaignId: string, request: UpdateCampaignRequest): Promise<UpdateCampaignResponse> {
		try {

			const response = await this.client.patch(`/api/organizations/${organizationId}/coupons/${couponId}/campaigns/${campaignId}`, request);
			return response.data as UpdateCampaignResponse;
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
	 * Delete campaign
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - 
	 * @param campaignId - 
	 * @returns Promise<DeleteCampaignResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async deleteCampaign(organizationId: string, couponId: string, campaignId: string): Promise<DeleteCampaignResponse> {
		try {

			const response = await this.client.delete(`/api/organizations/${organizationId}/coupons/${couponId}/campaigns/${campaignId}`);
			return response.data as DeleteCampaignResponse;
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
	 * Deactivate campaign
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - Coupon id
	 * @param campaignId - 
	 * @returns Promise<DeactivateCampaignResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async deactivateCampaign(organizationId: string, couponId: string, campaignId: string): Promise<DeactivateCampaignResponse> {
		try {

			const response = await this.client.post(`/api/organizations/${organizationId}/coupons/${couponId}/campaigns/${campaignId}/deactivate`, undefined);
			return response.data as DeactivateCampaignResponse;
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
	 * Reactivate campaign
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - Coupon id
	 * @param campaignId - 
	 * @returns Promise<ReactivateCampaignResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async reactivateCampaign(organizationId: string, couponId: string, campaignId: string): Promise<ReactivateCampaignResponse> {
		try {

			const response = await this.client.post(`/api/organizations/${organizationId}/coupons/${couponId}/campaigns/${campaignId}/reactivate`, undefined);
			return response.data as ReactivateCampaignResponse;
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
	 * Fetch campaigns summary
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - 
	 * @param take - Optional page size. Default is 10
	 * @param skip - Optional page offset. Default is 0
	 * @param acceptType - 
	 * @returns Promise<FetchCampaignsSummaryResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchCampaignsSummary(organizationId: string, couponId: string, take?: number, skip?: number, acceptType?: string): Promise<FetchCampaignsSummaryResponse> {
		try {

			const headers: Record<string, string> = {};
			if (acceptType !== undefined) {
				headers["x-accept-type"] = acceptType;
			}

			const query: Record<string, unknown> = {
				"take": take,
				"skip": skip
			};

			const response = await this.client.get(`/api/organizations/${organizationId}/coupons/${couponId}/campaigns/summary`, { params: query, headers });
			return response.data as FetchCampaignsSummaryResponse;
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
	 * Fetch campaign summary
	 * 
	 *
	 * @param organizationId - 
	 * @param couponId - 
	 * @param campaignId - 
	 * @param acceptType - 
	 * @returns Promise<FetchCampaignSummaryResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchCampaignSummary(organizationId: string, couponId: string, campaignId: string, acceptType?: string): Promise<FetchCampaignSummaryResponse> {
		try {

			const headers: Record<string, string> = {};
			if (acceptType !== undefined) {
				headers["x-accept-type"] = acceptType;
			}

			const response = await this.client.get(`/api/organizations/${organizationId}/coupons/${couponId}/campaigns/${campaignId}/summary`, { headers });
			return response.data as FetchCampaignSummaryResponse;
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

