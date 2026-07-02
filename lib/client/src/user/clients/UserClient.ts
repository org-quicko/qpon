/**
 * UserClient
 * Auto-generated - DO NOT EDIT
 */
import axios, { AxiosInstance, AxiosError } from "axios";
import { ApiError } from "../errors/common/ApiError";
import { FetchUsers404UsersNotFoundError } from "../errors/user/fetch-users/FetchUsers404UsersNotFoundError";
import { CreateSuperAdmin409SuperAdminAlreadyExistsError } from "../errors/user/create-super-admin/CreateSuperAdmin409SuperAdminAlreadyExistsError";
import { FetchUsersOfAnOrganization404UsersNotFoundError } from "../errors/user/fetch-users-of-an-organization/FetchUsersOfAnOrganization404UsersNotFoundError";
import { CreateUser400BadRequestError } from "../errors/user/create-user/CreateUser400BadRequestError";
import { CreateUser409UserAlreadyExistsError } from "../errors/user/create-user/CreateUser409UserAlreadyExistsError";
import { UpdateUser404UserNotFoundError } from "../errors/user/update-user/UpdateUser404UserNotFoundError";
import { DeleteUser404UserNotFoundError } from "../errors/user/delete-user/DeleteUser404UserNotFoundError";
import { Login401UnauthorizedError } from "../errors/user/login/Login401UnauthorizedError";
import { FetchUser404UserNotFoundError } from "../errors/user/fetch-user/FetchUser404UserNotFoundError";
import type { FetchUsersHttp404ErrorBody } from "../schemas/user/fetch-users/FetchUsersHttp404ErrorBody";
import type { CreateSuperAdminHttp409ErrorBody } from "../schemas/user/create-super-admin/CreateSuperAdminHttp409ErrorBody";
import type { FetchUsersOfAnOrganizationHttp404ErrorBody } from "../schemas/user/fetch-users-of-an-organization/FetchUsersOfAnOrganizationHttp404ErrorBody";
import type { CreateUserHttp400ErrorBody } from "../schemas/user/create-user/CreateUserHttp400ErrorBody";
import type { CreateUserHttp409ErrorBody } from "../schemas/user/create-user/CreateUserHttp409ErrorBody";
import type { UpdateUserHttp404ErrorBody } from "../schemas/user/update-user/UpdateUserHttp404ErrorBody";
import type { DeleteUserHttp404ErrorBody } from "../schemas/user/delete-user/DeleteUserHttp404ErrorBody";
import type { LoginHttp401ErrorBody } from "../schemas/user/login/LoginHttp401ErrorBody";
import type { FetchUserHttp404ErrorBody } from "../schemas/user/fetch-user/FetchUserHttp404ErrorBody";
import { SDKInterceptors } from "../interceptors/user/interceptors";
import type { BeforeRequestInterceptor, AfterResponseInterceptor } from "../interceptors/types";
import type { FetchUsersResponse } from "../schemas/user/fetch-users/FetchUsersResponse";
import type { CreateSuperAdminRequest } from "../schemas/user/create-super-admin/CreateSuperAdminRequest";
import type { CreateSuperAdminResponse } from "../schemas/user/create-super-admin/CreateSuperAdminResponse";
import type { FetchUsersOfAnOrganizationResponse } from "../schemas/user/fetch-users-of-an-organization/FetchUsersOfAnOrganizationResponse";
import type { CreateUserRequest } from "../schemas/user/create-user/CreateUserRequest";
import type { CreateUserResponse } from "../schemas/user/create-user/CreateUserResponse";
import type { UpdateUserRequest } from "../schemas/user/update-user/UpdateUserRequest";
import type { UpdateUserResponse } from "../schemas/user/update-user/UpdateUserResponse";
import type { DeleteUserResponse } from "../schemas/user/delete-user/DeleteUserResponse";
import type { LoginRequest } from "../schemas/user/login/LoginRequest";
import type { LoginResponse } from "../schemas/user/login/LoginResponse";
import type { UpdateUserRoleInOrganizationRequest } from "../schemas/user/update-user-role-in-organization/UpdateUserRoleInOrganizationRequest";
import type { UpdateUserRoleInOrganizationResponse } from "../schemas/user/update-user-role-in-organization/UpdateUserRoleInOrganizationResponse";
import type { FetchUserResponse } from "../schemas/user/fetch-user/FetchUserResponse";

export interface UserClientOptions {
	baseUrl: string;
	/** Bearer token */
	token?: string;
	/** API key (x-api-key) */
	apiKey?: string;
	/** API key (x-api-secret) */
	apiSecret?: string;
}

export class UserClient {

	private readonly client: AxiosInstance;
	private readonly interceptors: SDKInterceptors;

	constructor(
		options: UserClientOptions,
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
	 * Fetch users
	 * 
	 *
	 * @returns Promise<FetchUsersResponse> - Typed response body on success
	 * @throws FetchUsers404UsersNotFoundError on 404 responses
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchUsers(): Promise<FetchUsersResponse> {
		try {

			const response = await this.client.get(`/api/users`);
			return response.data as FetchUsersResponse;
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				switch (error.response.status) {
					case 404:
						throw new FetchUsers404UsersNotFoundError(error.response.data as FetchUsersHttp404ErrorBody, error.response);
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
	 * Create super admin
	 * 
	 *
	 * @param request - The request body
	 * @returns Promise<CreateSuperAdminResponse> - Typed response body on success
	 * @throws CreateSuperAdmin409SuperAdminAlreadyExistsError on 409 responses
	 * @throws ApiError on other non-2xx responses
	 */
	public async createSuperAdmin(request: CreateSuperAdminRequest): Promise<CreateSuperAdminResponse> {
		try {

			const response = await this.client.post(`/api/users`, request);
			return response.data as CreateSuperAdminResponse;
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				switch (error.response.status) {
					case 409:
						throw new CreateSuperAdmin409SuperAdminAlreadyExistsError(error.response.data as CreateSuperAdminHttp409ErrorBody, error.response);
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
	 * Fetch users of an organization
	 * 
	 *
	 * @param organizationId - 
	 * @returns Promise<FetchUsersOfAnOrganizationResponse> - Typed response body on success
	 * @throws FetchUsersOfAnOrganization404UsersNotFoundError on 404 responses
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchUsersOfAnOrganization(organizationId: string): Promise<FetchUsersOfAnOrganizationResponse> {
		try {

			const response = await this.client.get(`/api/organizations/${organizationId}/users`);
			return response.data as FetchUsersOfAnOrganizationResponse;
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				switch (error.response.status) {
					case 404:
						throw new FetchUsersOfAnOrganization404UsersNotFoundError(error.response.data as FetchUsersOfAnOrganizationHttp404ErrorBody, error.response);
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
	 * Create user
	 * 
	 *
	 * @param organizationId - 
	 * @param request - The request body
	 * @returns Promise<CreateUserResponse> - Typed response body on success
	 * @throws CreateUser400BadRequestError on 400 responses
	 * @throws CreateUser409UserAlreadyExistsError on 409 responses
	 * @throws ApiError on other non-2xx responses
	 */
	public async createUser(organizationId: string, request: CreateUserRequest): Promise<CreateUserResponse> {
		try {

			const response = await this.client.post(`/api/organizations/${organizationId}/users`, request);
			return response.data as CreateUserResponse;
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				switch (error.response.status) {
					case 400:
						throw new CreateUser400BadRequestError(error.response.data as CreateUserHttp400ErrorBody, error.response);
					case 409:
						throw new CreateUser409UserAlreadyExistsError(error.response.data as CreateUserHttp409ErrorBody, error.response);
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
	 * Update user
	 * 
	 *
	 * @param organizationId - 
	 * @param userId - 
	 * @param request - The request body
	 * @returns Promise<UpdateUserResponse> - Typed response body on success
	 * @throws UpdateUser404UserNotFoundError on 404 responses
	 * @throws ApiError on other non-2xx responses
	 */
	public async updateUser(organizationId: string, userId: string, request: UpdateUserRequest): Promise<UpdateUserResponse> {
		try {

			const response = await this.client.patch(`/api/organizations/${organizationId}/users/${userId}`, request);
			return response.data as UpdateUserResponse;
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				switch (error.response.status) {
					case 404:
						throw new UpdateUser404UserNotFoundError(error.response.data as UpdateUserHttp404ErrorBody, error.response);
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
	 * Delete user
	 * 
	 *
	 * @param organizationId - 
	 * @param userId - 
	 * @returns Promise<DeleteUserResponse> - Typed response body on success
	 * @throws DeleteUser404UserNotFoundError on 404 responses
	 * @throws ApiError on other non-2xx responses
	 */
	public async deleteUser(organizationId: string, userId: string): Promise<DeleteUserResponse> {
		try {

			const response = await this.client.delete(`/api/organizations/${organizationId}/users/${userId}`);
			return response.data as DeleteUserResponse;
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				switch (error.response.status) {
					case 404:
						throw new DeleteUser404UserNotFoundError(error.response.data as DeleteUserHttp404ErrorBody, error.response);
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
	 * Login
	 * 
	 *
	 * @param request - The request body
	 * @returns Promise<LoginResponse> - Typed response body on success
	 * @throws Login401UnauthorizedError on 401 responses
	 * @throws ApiError on other non-2xx responses
	 */
	public async login(request: LoginRequest): Promise<LoginResponse> {
		try {

			const response = await this.client.post(`/api/users/login`, request);
			return response.data as LoginResponse;
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				switch (error.response.status) {
					case 401:
						throw new Login401UnauthorizedError(error.response.data as LoginHttp401ErrorBody, error.response);
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
	 * Update user role in organization
	 * 
	 *
	 * @param organizationId - 
	 * @param userId - 
	 * @param request - The request body
	 * @returns Promise<UpdateUserRoleInOrganizationResponse> - Typed response body on success
	 * @throws ApiError on other non-2xx responses
	 */
	public async updateUserRoleInOrganization(organizationId: any, userId: any, request: UpdateUserRoleInOrganizationRequest): Promise<UpdateUserRoleInOrganizationResponse> {
		try {

			const response = await this.client.patch(`/api/organizations/${organizationId}/users/${userId}/role`, request);
			return response.data as UpdateUserRoleInOrganizationResponse;
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
	 * Fetch user
	 * 
	 *
	 * @param userId - 
	 * @returns Promise<FetchUserResponse> - Typed response body on success
	 * @throws FetchUser404UserNotFoundError on 404 responses
	 * @throws ApiError on other non-2xx responses
	 */
	public async fetchUser(userId: string): Promise<FetchUserResponse> {
		try {

			const response = await this.client.get(`/api/users/${userId}`);
			return response.data as FetchUserResponse;
		} catch (error) {
			if (error instanceof AxiosError && error.response) {
				switch (error.response.status) {
					case 404:
						throw new FetchUser404UserNotFoundError(error.response.data as FetchUserHttp404ErrorBody, error.response);
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

