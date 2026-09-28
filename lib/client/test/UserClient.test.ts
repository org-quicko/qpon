import { beforeEach, describe, expect, it } from "vitest";
import { UserClient } from "../src/user/clients/UserClient";
import type { CreateSuperAdminRequest } from "../src/user/schemas/user/create-super-admin/CreateSuperAdminRequest";
import type { CreateUserRequest } from "../src/user/schemas/user/create-user/CreateUserRequest";
import type { LoginRequest } from "../src/user/schemas/user/login/LoginRequest";
import type { UpdateUserRequest } from "../src/user/schemas/user/update-user/UpdateUserRequest";
import type { UpdateUserRoleInOrganizationRequest } from "../src/user/schemas/user/update-user-role-in-organization/UpdateUserRoleInOrganizationRequest";

const BASE_URL = process.env.QPON_BASE_URL ?? "";
const API_KEY = process.env.QPON_API_KEY ?? "";
const API_SECRET = process.env.QPON_API_SECRET ?? "";
const ORGANIZATION_ID = process.env.QPON_ORGANIZATION_ID ?? "";

const CONFIGURED = Boolean(BASE_URL && API_KEY && API_SECRET && ORGANIZATION_ID);

describe.skipIf(!CONFIGURED)("UserClient", () => {
	const USER_ID = process.env.QPON_USER_ID ?? "a2f5c1d0-9b74-4c3e-8f21-6d0a4b7e9c15";
	const USER_NAME = "Priya Sharma";
	const USER_EMAIL = "priya.sharma@example.com";
	const USER_PASSWORD = "S3cure-Passw0rd!";
	const USER_ROLE = "admin";
	const SUPER_ADMIN_ROLE = "super_admin";

	let client: UserClient;

	beforeEach(() => {
		client = new UserClient({
			baseUrl: BASE_URL,
			apiKey: API_KEY,
			apiSecret: API_SECRET,
		});
	});

	describe("login", () => {
		it("should hit login api and return defined result", async () => {
			const request: LoginRequest = {
				email: USER_EMAIL,
				password: USER_PASSWORD,
			};

			const result = await client.login(request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchUsers", () => {
		it("should hit fetch users api and return defined result", async () => {
			const result = await client.fetchUsers();

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("createSuperAdmin", () => {
		it("should hit create super admin api and return defined result", async () => {
			const request: CreateSuperAdminRequest = {
				"@entity": "org.quicko.qpon.user",
				name: USER_NAME,
				email: USER_EMAIL,
				password: USER_PASSWORD,
				role: SUPER_ADMIN_ROLE,
			};

			const result = await client.createSuperAdmin(request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchUsersOfAnOrganization", () => {
		it("should hit fetch users of an organization api and return defined result", async () => {
			const result = await client.fetchUsersOfAnOrganization(ORGANIZATION_ID);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("createUser", () => {
		it("should hit create user api and return defined result", async () => {
			const request: CreateUserRequest = {
				"@entity": "org.quicko.qpon.user",
				name: USER_NAME,
				email: USER_EMAIL,
				password: USER_PASSWORD,
				role: USER_ROLE,
			};

			const result = await client.createUser(ORGANIZATION_ID, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchUser", () => {
		it("should hit fetch user api and return defined result", async () => {
			const result = await client.fetchUser(USER_ID);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("updateUser", () => {
		it("should hit update user api and return defined result", async () => {
			const request: UpdateUserRequest = {
				"@entity": "org.quicko.qpon.user",
				name: USER_NAME,
				email: USER_EMAIL,
			};

			const result = await client.updateUser(ORGANIZATION_ID, USER_ID, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("updateUserRoleInOrganization", () => {
		it("should hit update user role in organization api and return defined result", async () => {
			const request: UpdateUserRoleInOrganizationRequest = {
				"@entity": "org.quicko.qpon.user",
				role: USER_ROLE,
			};

			const result = await client.updateUserRoleInOrganization(ORGANIZATION_ID, USER_ID, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("deleteUser", () => {
		it("should hit delete user api and return defined result", async () => {
			const result = await client.deleteUser(ORGANIZATION_ID, USER_ID);

			expect(result).toBeDefined();
		}, 30000);
	});
});
