import { beforeEach, describe, expect, it } from "vitest";
import { CouponItemClient } from "../src/coupon-item/clients/CouponItemClient";
import type { AddItemsRequest } from "../src/coupon-item/schemas/coupon-item/add-items/AddItemsRequest";
import type { UpdateItemsRequest } from "../src/coupon-item/schemas/coupon-item/update-items/UpdateItemsRequest";

const BASE_URL = process.env.QPON_BASE_URL ?? "";
const API_KEY = process.env.QPON_API_KEY ?? "";
const API_SECRET = process.env.QPON_API_SECRET ?? "";
const ORGANIZATION_ID = process.env.QPON_ORGANIZATION_ID ?? "";

const CONFIGURED = Boolean(BASE_URL && API_KEY && API_SECRET && ORGANIZATION_ID);

describe.skipIf(!CONFIGURED)("CouponItemClient", () => {
	const COUPON_ID = process.env.QPON_COUPON_ID ?? "1c9d4f6a-3e57-4b28-9a10-7c5b8d2e4f60";
	const ITEM_ID = process.env.QPON_ITEM_ID ?? "7e4a9c26-5d81-4b73-a0f6-8c2e1d5b3a94";
	const ITEM_NAME = "Wireless Headphones";
	const TAKE = 10;
	const SKIP = 0;

	let client: CouponItemClient;

	beforeEach(() => {
		client = new CouponItemClient({
			baseUrl: BASE_URL,
			apiKey: API_KEY,
			apiSecret: API_SECRET,
		});
	});

	describe("fetchCouponItems", () => {
		it("should hit fetch coupon items api and return defined result", async () => {
			const result = await client.fetchCouponItems(ORGANIZATION_ID, COUPON_ID, SKIP, TAKE, ITEM_NAME);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("addItems", () => {
		it("should hit add items api and return defined result", async () => {
			const request: AddItemsRequest = {
				"@entity": "org.quicko.qpon.coupon_item",
				items: [ITEM_ID],
			};

			const result = await client.addItems(ORGANIZATION_ID, COUPON_ID, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("updateItems", () => {
		it("should hit update items api and return defined result", async () => {
			const request: UpdateItemsRequest = {
				"@entity": "org.quicko.qpon.coupon_item",
				items: [ITEM_ID],
			};

			const result = await client.updateItems(ORGANIZATION_ID, COUPON_ID, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("removeItem", () => {
		it("should hit remove item api and return defined result", async () => {
			const result = await client.removeItem(ORGANIZATION_ID, COUPON_ID, ITEM_ID);

			expect(result).toBeDefined();
		}, 30000);
	});
});
