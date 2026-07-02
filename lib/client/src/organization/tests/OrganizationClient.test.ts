import { beforeEach, describe, expect, it } from "vitest";
import { OrganizationClient } from "../clients/OrganizationClient";
import type { CreateOrganizationRequest } from "../schemas/organization/create-organization/CreateOrganizationRequest";
import type { UpdateOrganizationRequest } from "../schemas/organization/update-organization/UpdateOrganizationRequest";

describe("OrganizationClient", () => {
	// Test constants
	const EXTERNALID = "dolor qui Ut";
	const TAKE = 43912623;
	const SKIP = 95398546;
	const NAME = "in Excepteur in nulla dolore";
	const ENTITY = "org.quicko.qpon.organization";
	const CURRENCY = "proident adipisicing reprehenderit pariatur";
	const ORGANIZATIONID = "nulla voluptate Duis occaecat";
	const UPDATEORGANIZATION_ENTITY = "org.quicko.qpon.organization";
	const EXTERNAL_ID = "sit incididunt exercitation eu";

	let client: OrganizationClient;

	beforeEach(() => {
		client = new OrganizationClient({
			baseUrl: "https://api.example.com",
			// token: "your-token",
			// apiKey: "your-apiKey",
			// apiSecret: "your-apiSecret",
		});
	});

	describe("fetchOrganizations", () => {
		it("should hit fetch organizations api and return defined result", async () => {
			const externalId = EXTERNALID;
			const take = TAKE;
			const skip = SKIP;
			const name = NAME;

			const result = await client.fetchOrganizations(externalId, take, skip, name);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("createOrganization", () => {
		it("should hit create organization api and return defined result", async () => {
			const request = {
				'@entity': ENTITY,
				'name': NAME,
				'currency': CURRENCY
			} as CreateOrganizationRequest;

			const result = await client.createOrganization(request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchOrganization", () => {
		it("should hit fetch organization api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;

			const result = await client.fetchOrganization(organizationId);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("updateOrganization", () => {
		it("should hit update organization api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const request = {
				'@entity': UPDATEORGANIZATION_ENTITY,
				'name': NAME,
				'external_id': EXTERNAL_ID,
				'currency': CURRENCY
			} as UpdateOrganizationRequest;

			const result = await client.updateOrganization(organizationId, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("deleteOrganization", () => {
		it("should hit delete organization api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;

			const result = await client.deleteOrganization(organizationId);

			expect(result).toBeDefined();
		}, 30000);
	});

});
