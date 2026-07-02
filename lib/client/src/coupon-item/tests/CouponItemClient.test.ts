import { beforeEach, describe, expect, it } from "vitest";
import { CouponItemClient } from "../clients/CouponItemClient";
import type { AddItemsRequest } from "../schemas/coupon-item/add-items/AddItemsRequest";
import type { UpdateItemsRequest } from "../schemas/coupon-item/update-items/UpdateItemsRequest";

describe("CouponItemClient", () => {
	// Test constants
	const ORGANIZATIONID = "ad cupidatat cillum eiusmod voluptate";
	const COUPONID = "velit";
	const SKIP = -10316529;
	const TAKE = -97629138;
	const NAME = "veniam aliquip nulla";
	const ENTITY = "org.quicko.qpon.coupon_item";
	const ITEMS = ["ut adipisicing","id officia","qui","sit tempor aute enim"];
	const UPDATEITEMS_ENTITY = "org.quicko.qpon.coupon_item";
	const ITEMID = "consectetur nostrud amet ullamco velit";

	let client: CouponItemClient;

	beforeEach(() => {
		client = new CouponItemClient({
			baseUrl: "https://api.example.com",
			// token: "your-token",
			// apiKey: "your-apiKey",
			// apiSecret: "your-apiSecret",
		});
	});

	describe("fetchCouponItems", () => {
		it("should hit fetch coupon items api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;
			const skip = SKIP;
			const take = TAKE;
			const name = NAME;

			const result = await client.fetchCouponItems(organizationId, couponId, skip, take, name);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("addItems", () => {
		it("should hit add items api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;
			const request = {
				'@entity': ENTITY,
				'items': ITEMS
			} as AddItemsRequest;

			const result = await client.addItems(organizationId, couponId, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("updateItems", () => {
		it("should hit update items api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;
			const request = {
				'@entity': UPDATEITEMS_ENTITY
			} as UpdateItemsRequest;

			const result = await client.updateItems(organizationId, couponId, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("removeItem", () => {
		it("should hit remove item api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;
			const itemId = ITEMID;

			const result = await client.removeItem(organizationId, couponId, itemId);

			expect(result).toBeDefined();
		}, 30000);
	});

});
