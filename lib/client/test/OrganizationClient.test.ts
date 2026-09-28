import { beforeEach, describe, expect, it } from "vitest";
import { OrganizationClient } from "../src/organization/clients/OrganizationClient";
import type { CreateOrganizationRequest } from "../src/organization/schemas/organization/create-organization/CreateOrganizationRequest";
import type { UpdateOrganizationRequest } from "../src/organization/schemas/organization/update-organization/UpdateOrganizationRequest";

const BASE_URL = process.env.QPON_BASE_URL ?? "";
const API_KEY = process.env.QPON_API_KEY ?? "";
const API_SECRET = process.env.QPON_API_SECRET ?? "";
const ORGANIZATION_ID = process.env.QPON_ORGANIZATION_ID ?? "";

const CONFIGURED = Boolean(BASE_URL && API_KEY && API_SECRET && ORGANIZATION_ID);

describe.skipIf(!CONFIGURED)("OrganizationClient", () => {
	const ORGANIZATION_NAME = "Acme Retail";
	const ORGANIZATION_EXTERNAL_ID = "acme-retail";
	const CURRENCY = "INR";
	const TAKE = 10;
	const SKIP = 0;

	let client: OrganizationClient;

	beforeEach(() => {
		client = new OrganizationClient({
			baseUrl: BASE_URL,
			apiKey: API_KEY,
			apiSecret: API_SECRET,
		});
	});

	describe("fetchOrganizations", () => {
		it("should hit fetch organizations api and return defined result", async () => {
			const result = await client.fetchOrganizations(ORGANIZATION_EXTERNAL_ID, TAKE, SKIP, ORGANIZATION_NAME);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("createOrganization", () => {
		it("should hit create organization api and return defined result", async () => {
			const request: CreateOrganizationRequest = {
				"@entity": "org.quicko.qpon.organization",
				name: ORGANIZATION_NAME,
				external_id: ORGANIZATION_EXTERNAL_ID,
				currency: CURRENCY,
			};

			const result = await client.createOrganization(request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchOrganization", () => {
		it("should hit fetch organization api and return defined result", async () => {
			const result = await client.fetchOrganization(ORGANIZATION_ID);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("updateOrganization", () => {
		it("should hit update organization api and return defined result", async () => {
			const request: UpdateOrganizationRequest = {
				"@entity": "org.quicko.qpon.organization",
				name: `${ORGANIZATION_NAME} (updated)`,
				external_id: ORGANIZATION_EXTERNAL_ID,
				currency: CURRENCY,
			};

			const result = await client.updateOrganization(ORGANIZATION_ID, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("deleteOrganization", () => {
		it("should hit delete organization api and return defined result", async () => {
			const result = await client.deleteOrganization(ORGANIZATION_ID);

			expect(result).toBeDefined();
		}, 30000);
	});
});
