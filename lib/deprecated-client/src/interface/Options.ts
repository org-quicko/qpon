export interface Options {
	url?: string;
	baseURL?: string;
	headers?: any;
	params?: object;
	queryParams?: Record<string, string | number | boolean>,
	data?: object;
}