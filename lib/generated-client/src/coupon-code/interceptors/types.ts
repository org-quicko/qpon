/**
 * Interceptor Types
 * Auto-generated - DO NOT EDIT
 */
import type { InternalAxiosRequestConfig, AxiosResponse } from "axios";

export type Awaitable<T> = T | Promise<T>;

/**
 * BeforeRequestInterceptor is called before the SDK sends a request.
 * The interceptor can modify the request config (e.g., add headers, encrypt body)
 * or throw an error to stop the request from being sent.
 */
export interface BeforeRequestInterceptor {
	beforeRequest: (config: InternalAxiosRequestConfig) => Awaitable<InternalAxiosRequestConfig>;
}

/**
 * AfterResponseInterceptor is called after the SDK receives a successful response.
 * The interceptor can modify the response (e.g., decrypt body, add logging)
 * or throw an error to stop the response from being handled.
 */
export interface AfterResponseInterceptor {
	afterResponse: (response: AxiosResponse) => Awaitable<AxiosResponse>;
}

/**
 * Interceptors registration interface.
 * Used in the registration file to register interceptor instances.
 */
export interface Interceptors {

	requestInterceptors: BeforeRequestInterceptor[];
	responseInterceptors: AfterResponseInterceptor[];

	/** Register interceptors to modify request config before sending */
	registerBeforeRequestInterceptors(interceptors: BeforeRequestInterceptor[]): void;
	/** Register interceptors to modify response after receiving */
	registerAfterResponseInterceptors(interceptors: AfterResponseInterceptor[]): void;
}

export type Interceptor = BeforeRequestInterceptor | AfterResponseInterceptor;
