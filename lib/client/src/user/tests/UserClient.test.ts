import { beforeEach, describe, expect, it } from "vitest";
import { UserClient } from "../clients/UserClient";
import type { CreateSuperAdminRequest } from "../schemas/user/create-super-admin/CreateSuperAdminRequest";
import type { CreateUserRequest } from "../schemas/user/create-user/CreateUserRequest";
import type { UpdateUserRequest } from "../schemas/user/update-user/UpdateUserRequest";
import type { LoginRequest } from "../schemas/user/login/LoginRequest";
import type { UpdateUserRoleInOrganizationRequest } from "../schemas/user/update-user-role-in-organization/UpdateUserRoleInOrganizationRequest";

describe("UserClient", () => {
	// Test constants
	const ENTITY = "org.quicko.qpon.user";
	const EMAIL = "pAGr@TJBZaWlkju.ln";
	const ROLE = "viewer";
	const ORGANIZATIONID = "culpa eiusmod officia ea commodo";
	const CREATEUSER_ENTITY = "org.quicko.qpon.user";
	const NAME = "mollit culpa";
	const PASSWORD = "pariatur eiusmod";
	const USERID = "cillum ut pariatur";
	const UPDATEUSER_ENTITY = "org.quicko.qpon.user";

	let client: UserClient;

	beforeEach(() => {
		client = new UserClient({
			baseUrl: "https://api.example.com",
			// token: "your-token",
			// apiKey: "your-apiKey",
			// apiSecret: "your-apiSecret",
		});
	});

	describe("fetchUsers", () => {
		it("should hit fetch users api and return defined result", async () => {

			const result = await client.fetchUsers();

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("createSuperAdmin", () => {
		it("should hit create super admin api and return defined result", async () => {
			const request = {
				'@entity': ENTITY,
				'email': EMAIL,
				'role': ROLE
			} as CreateSuperAdminRequest;

			const result = await client.createSuperAdmin(request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchUsersOfAnOrganization", () => {
		it("should hit fetch users of an organization api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;

			const result = await client.fetchUsersOfAnOrganization(organizationId);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("createUser", () => {
		it("should hit create user api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const request = {
				'@entity': CREATEUSER_ENTITY,
				'name': NAME,
				'email': EMAIL,
				'password': PASSWORD,
				'role': ROLE
			} as CreateUserRequest;

			const result = await client.createUser(organizationId, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("updateUser", () => {
		it("should hit update user api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const userId = USERID;
			const request = {
				'@entity': UPDATEUSER_ENTITY,
				'name': NAME,
				'email': EMAIL
			} as UpdateUserRequest;

			const result = await client.updateUser(organizationId, userId, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("deleteUser", () => {
		it("should hit delete user api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const userId = USERID;

			const result = await client.deleteUser(organizationId, userId);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("login", () => {
		it("should hit login api and return defined result", async () => {
			// TODO: request is a complex type — provide a valid LoginRequest object here
			const request = {} as LoginRequest;

			const result = await client.login(request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("updateUserRoleInOrganization", () => {
		it("should hit update user role in organization api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const userId = USERID;
			// TODO: request is a complex type — provide a valid UpdateUserRoleInOrganizationRequest object here
			const request = {} as UpdateUserRoleInOrganizationRequest;

			const result = await client.updateUserRoleInOrganization(organizationId, userId, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchUser", () => {
		it("should hit fetch user api and return defined result", async () => {
			const userId = USERID;

			const result = await client.fetchUser(userId);

			expect(result).toBeDefined();
		}, 30000);
	});

});
