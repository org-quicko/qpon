import { beforeEach, describe, expect, it } from "vitest";
import { CustomerCouponCodeClient } from "../clients/CustomerCouponCodeClient";
import type { AddCustomersRequest } from "../schemas/customer-coupon-code/add-customers/AddCustomersRequest";
import type { UpdateCustomersRequest } from "../schemas/customer-coupon-code/update-customers/UpdateCustomersRequest";

describe("CustomerCouponCodeClient", () => {
	// Test constants
	const COUPONID = "veniam enim";
	const CAMPAIGNID = "id";
	const COUPONCODEID = "do cillum enim";
	const ENTITY = "org.quicko.qpon.customer_coupon_code";
	const CUSTOMERS = ["voluptate amet in deserunt ea","dolor mollit"];
	const UPDATECUSTOMERS_ENTITY = "org.quicko.qpon.customer_coupon_code";
	const CUSTOMERID = "deserunt velit id";

	let client: CustomerCouponCodeClient;

	beforeEach(() => {
		client = new CustomerCouponCodeClient({
			baseUrl: "https://api.example.com",
			// token: "your-token",
			// apiKey: "your-apiKey",
			// apiSecret: "your-apiSecret",
		});
	});

	describe("fetchCustomersForCouponCode", () => {
		it("should hit fetch customers api and return defined result", async () => {
			const couponId = COUPONID;
			const campaignId = CAMPAIGNID;
			const couponCodeId = COUPONCODEID;

			const result = await client.fetchCustomersForCouponCode(couponId, campaignId, couponCodeId);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("addCustomers", () => {
		it("should hit add customers api and return defined result", async () => {
			const couponId = COUPONID;
			const campaignId = CAMPAIGNID;
			const couponCodeId = COUPONCODEID;
			const request = {
				'@entity': ENTITY,
				'customers': CUSTOMERS
			} as AddCustomersRequest;

			const result = await client.addCustomers(couponId, campaignId, couponCodeId, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("updateCustomers", () => {
		it("should hit update customers api and return defined result", async () => {
			const couponId = COUPONID;
			const campaignId = CAMPAIGNID;
			const couponCodeId = COUPONCODEID;
			const request = {
				'@entity': UPDATECUSTOMERS_ENTITY,
				'customers': CUSTOMERS
			} as UpdateCustomersRequest;

			const result = await client.updateCustomers(couponId, campaignId, couponCodeId, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("deleteCustomers", () => {
		it("should hit delete customers api and return defined result", async () => {
			const couponId = COUPONID;
			const campaignId = CAMPAIGNID;
			const couponCodeId = COUPONCODEID;
			const customerId = CUSTOMERID;

			const result = await client.deleteCustomers(couponId, campaignId, couponCodeId, customerId);

			expect(result).toBeDefined();
		}, 30000);
	});

});
