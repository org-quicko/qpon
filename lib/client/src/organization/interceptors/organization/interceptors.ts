/**
 * SDK Interceptors
 * Auto-generated - DO NOT EDIT
 */
import type { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import type {
	BeforeRequestInterceptor,
	AfterResponseInterceptor,
	Interceptors,
} from "../types";
import { initInterceptors } from "./registration";

export class SDKInterceptors implements Interceptors {
	requestInterceptors: BeforeRequestInterceptor[] = [];
	responseInterceptors: AfterResponseInterceptor[] = [];

	constructor() {
		const presetRequestInterceptors: BeforeRequestInterceptor[] = [];
		const presetResponseInterceptors: AfterResponseInterceptor[] = [];

		this.registerBeforeRequestInterceptors(presetRequestInterceptors);
		this.registerAfterResponseInterceptors(presetResponseInterceptors);
		
		initInterceptors(this);
	}

	registerBeforeRequestInterceptors(interceptors: BeforeRequestInterceptor[]): void {
		this.requestInterceptors.push(...interceptors);
	}

	registerAfterResponseInterceptors(interceptors: AfterResponseInterceptor[]): void {
		this.responseInterceptors.push(...interceptors);
	}

	async beforeRequest(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
		let cfg = config;
		for (const interceptor of this.requestInterceptors) {
			cfg = await interceptor.beforeRequest(cfg);
		}
		return cfg;
	}

	async afterResponse(response: AxiosResponse): Promise<AxiosResponse> {
		let res = response;
		for (const interceptor of this.responseInterceptors) {
			res = await interceptor.afterResponse(res);
		}
		return res;
	}
}
