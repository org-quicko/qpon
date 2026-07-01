/**
 * OfferClient
 * Auto-generated - DO NOT EDIT
 */
import axios, { AxiosInstance, AxiosError } from "axios";
import { ApiError } from "../errors/common/ApiError";
import { SDKInterceptors } from "../interceptors/offer/interceptors";
import type { BeforeRequestInterceptor, AfterResponseInterceptor } from "../interceptors/types";
import type { FetchOfferResponse } from "../schemas/offer/fetch-offer/FetchOfferResponse";
import type { FetchOffersResponse } from "../schemas/offer/fetch-offers/FetchOffersResponse";

export interface OfferClientOptions {
	baseUrl: string;
	/** Bearer token */
	token?: string;
	/** API key (x-api-key) */
	apiKey?: string;
	/** API key (x-api-secret) */
	apiSecret?: string;
}

export class OfferClient {

	private readonly client: AxiosInstance;
	private readonly interceptors: SDKInterceptors;

	constructor(
		options: OfferClientOptions,
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
	 * Fetch offer
	 * 
	 *
	 * @param organizationId - 
	 * @param externalCustomerId - Filter to get customer specific offer
	 * @param code - Filter to get offers by code
	 * @param externalItemId - Filter to get offers by item id
	 * @param acceptType - 
	 * @returns Promise<FetchOfferResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchOffer(organizationId: string, externalCustomerId?: string, code?: string, externalItemId?: string, acceptType?: string): Promise<FetchOfferResponse> {
		try {

			const headers: Record<string, string> = {};
			if (acceptType !== undefined) {
				headers["x-accept-type"] = acceptType;
			}

			const query: Record<string, unknown> = {
				"external_customer_id": externalCustomerId,
				"code": code,
				"external_item_id": externalItemId
			};

			const response = await this.client.get(`/api/organizations/${organizationId}/offer`, { params: query, headers });
			return response.data as FetchOfferResponse;
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
	 * Fetch offers
	 * 
	 *
	 * @param organizationId - 
	 * @param externalItemId - 
	 * @param externalCustomerId - Filter to get customer specific coupon codes
	 * @param sort - Sort the results
	 * @param discountType - Filter to get offers by discount type
	 * @param skip - Optional page offset. Default is 0
	 * @param take - Optional page size. Default is 10
	 * @param acceptType - 
	 * @returns Promise<FetchOffersResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchOffers(organizationId: string, externalItemId?: string, externalCustomerId?: string, sort?: string, discountType?: string, skip?: number, take?: number, acceptType?: string): Promise<FetchOffersResponse> {
		try {

			const headers: Record<string, string> = {};
			if (acceptType !== undefined) {
				headers["x-accept-type"] = acceptType;
			}

			const query: Record<string, unknown> = {
				"external_item_id": externalItemId,
				"external_customer_id": externalCustomerId,
				"sort": sort,
				"discount_type": discountType,
				"skip": skip,
				"take": take
			};

			const response = await this.client.get(`/api/organizations/${organizationId}/offers`, { params: query, headers });
			return response.data as FetchOffersResponse;
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

