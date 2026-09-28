import { beforeEach, describe, expect, it } from "vitest";
import { CustomerClient } from "../src/customer/clients/CustomerClient";
import type { CreateCustomerRequest } from "../src/customer/schemas/customer/create-customer/CreateCustomerRequest";
import type { UpdateCustomerRequest } from "../src/customer/schemas/customer/update-customer/UpdateCustomerRequest";
import type { UpsertCustomerRequest } from "../src/customer/schemas/customer/upsert-customer/UpsertCustomerRequest";

const BASE_URL = process.env.QPON_BASE_URL ?? "";
const API_KEY = process.env.QPON_API_KEY ?? "";
const API_SECRET = process.env.QPON_API_SECRET ?? "";
const ORGANIZATION_ID = process.env.QPON_ORGANIZATION_ID ?? "";

const CONFIGURED = Boolean(BASE_URL && API_KEY && API_SECRET && ORGANIZATION_ID);

describe.skipIf(!CONFIGURED)("CustomerClient", () => {
	const CUSTOMER_ID = process.env.QPON_CUSTOMER_ID ?? "4a7c1e93-2b58-4d60-9f14-6e3a8b0d2c57";
	const CUSTOMER_EXTERNAL_ID = process.env.QPON_CUSTOMER_EXTERNAL_ID ?? "customer-1001";
	const CUSTOMER_NAME = "Rahul Mehta";
	const CUSTOMER_EMAIL = process.env.QPON_CUSTOMER_EMAIL ?? "rahul.mehta@example.com";
	const ISD_CODE = "+91";
	const PHONE = "9876543210";
	const TAKE = 10;
	const SKIP = 0;

	let client: CustomerClient;

	beforeEach(() => {
		client = new CustomerClient({
			baseUrl: BASE_URL,
			apiKey: API_KEY,
			apiSecret: API_SECRET,
		});
	});

	describe("fetchCustomers", () => {
		it("should hit fetch customers api and return defined result", async () => {
			const result = await client.fetchCustomers(ORGANIZATION_ID, SKIP, TAKE, CUSTOMER_EMAIL);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("createCustomer", () => {
		it("should hit create customer api and return defined result", async () => {
			const request: CreateCustomerRequest = {
				"@entity": "org.quicko.qpon.customer",
				name: CUSTOMER_NAME,
				email: CUSTOMER_EMAIL,
				isd_code: ISD_CODE,
				phone: PHONE,
				external_id: CUSTOMER_EXTERNAL_ID,
			};

			const result = await client.createCustomer(ORGANIZATION_ID, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchCustomer", () => {
		it("should hit fetch customer api and return defined result", async () => {
			const result = await client.fetchCustomer(ORGANIZATION_ID, CUSTOMER_ID, SKIP, TAKE);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("updateCustomer", () => {
		it("should hit update customer api and return defined result", async () => {
			const request: UpdateCustomerRequest = {
				"@entity": "org.quicko.qpon.customer",
				name: CUSTOMER_NAME,
				phone: PHONE,
			};

			const result = await client.updateCustomer(ORGANIZATION_ID, CUSTOMER_ID, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("upsertCustomer", () => {
		it("should hit upsert customer api and return defined result", async () => {
			const request: UpsertCustomerRequest = {
				"@entity": "org.quicko.qpon.customer",
				name: CUSTOMER_NAME,
				email: CUSTOMER_EMAIL,
				isd_code: ISD_CODE,
				phone: PHONE,
				external_id: CUSTOMER_EXTERNAL_ID,
			};

			const result = await client.upsertCustomer(ORGANIZATION_ID, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("deleteCustomer", () => {
		it("should hit delete customer api and return defined result", async () => {
			const result = await client.deleteCustomer(ORGANIZATION_ID, CUSTOMER_ID);

			expect(result).toBeDefined();
		}, 30000);
	});
});
