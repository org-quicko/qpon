import { beforeEach, describe, expect, it } from "vitest";
import { CustomerCouponCodeClient } from "../src/customer-coupon-code/clients/CustomerCouponCodeClient";
import type { AddCustomersRequest } from "../src/customer-coupon-code/schemas/customer-coupon-code/add-customers/AddCustomersRequest";
import type { UpdateCustomersRequest } from "../src/customer-coupon-code/schemas/customer-coupon-code/update-customers/UpdateCustomersRequest";

const BASE_URL = process.env.QPON_BASE_URL ?? "";
const API_KEY = process.env.QPON_API_KEY ?? "";
const API_SECRET = process.env.QPON_API_SECRET ?? "";
const ORGANIZATION_ID = process.env.QPON_ORGANIZATION_ID ?? "";

const CONFIGURED = Boolean(BASE_URL && API_KEY && API_SECRET && ORGANIZATION_ID);

describe.skipIf(!CONFIGURED)("CustomerCouponCodeClient", () => {
	const COUPON_ID = process.env.QPON_COUPON_ID ?? "1c9d4f6a-3e57-4b28-9a10-7c5b8d2e4f60";
	const CAMPAIGN_ID = process.env.QPON_CAMPAIGN_ID ?? "5b8e2a71-6c34-4f09-b7d5-2e8a1c460f93";
	const COUPON_CODE_ID = process.env.QPON_COUPON_CODE_ID ?? "9d3f7b04-1a62-4e85-8c07-3b9d5f2a6e18";
	const CUSTOMER_ID = process.env.QPON_CUSTOMER_ID ?? "4a7c1e93-2b58-4d60-9f14-6e3a8b0d2c57";

	let client: CustomerCouponCodeClient;

	beforeEach(() => {
		client = new CustomerCouponCodeClient({
			baseUrl: BASE_URL,
			apiKey: API_KEY,
			apiSecret: API_SECRET,
		});
	});

	describe("fetchCustomersForCouponCode", () => {
		it("should hit fetch customers for coupon code api and return defined result", async () => {
			const result = await client.fetchCustomersForCouponCode(COUPON_ID, CAMPAIGN_ID, COUPON_CODE_ID);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("addCustomers", () => {
		it("should hit add customers api and return defined result", async () => {
			const request: AddCustomersRequest = {
				"@entity": "org.quicko.qpon.customer_coupon_code",
				customers: [CUSTOMER_ID],
			};

			const result = await client.addCustomers(COUPON_ID, CAMPAIGN_ID, COUPON_CODE_ID, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("updateCustomers", () => {
		it("should hit update customers api and return defined result", async () => {
			const request: UpdateCustomersRequest = {
				"@entity": "org.quicko.qpon.customer_coupon_code",
				customers: [CUSTOMER_ID],
			};

			const result = await client.updateCustomers(COUPON_ID, CAMPAIGN_ID, COUPON_CODE_ID, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("deleteCustomers", () => {
		it("should hit delete customers api and return defined result", async () => {
			const result = await client.deleteCustomers(COUPON_ID, CAMPAIGN_ID, COUPON_CODE_ID, CUSTOMER_ID);

			expect(result).toBeDefined();
		}, 30000);
	});
});
