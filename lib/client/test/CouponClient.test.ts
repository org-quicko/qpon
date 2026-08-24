import { beforeEach, describe, expect, it } from "vitest";
import { CouponClient } from "../src/coupon/clients/CouponClient";
import type { CreateCouponRequest } from "../src/coupon/schemas/coupon/create-coupon/CreateCouponRequest";
import type { UpdateCouponRequest } from "../src/coupon/schemas/coupon/update-coupon/UpdateCouponRequest";

const BASE_URL = process.env.QPON_BASE_URL ?? "";
const API_KEY = process.env.QPON_API_KEY ?? "";
const API_SECRET = process.env.QPON_API_SECRET ?? "";
const ORGANIZATION_ID = process.env.QPON_ORGANIZATION_ID ?? "";

const CONFIGURED = Boolean(BASE_URL && API_KEY && API_SECRET && ORGANIZATION_ID);

describe.skipIf(!CONFIGURED)("CouponClient", () => {
	const COUPON_ID = process.env.QPON_COUPON_ID ?? "1c9d4f6a-3e57-4b28-9a10-7c5b8d2e4f60";
	const COUPON_NAME = "Festive Flat 10";
	const ITEM_EXTERNAL_ID = process.env.QPON_ITEM_EXTERNAL_ID ?? "sku-1001";
	const DISCOUNT_TYPE = "fixed";
	const DISCOUNT_VALUE = 10;
	const ITEM_CONSTRAINT = "all";
	const STATUS = "active";
	const SORT_BY = "created_at";
	const SORT_ORDER = "desc";
	const ACCEPT_JSON = "application/json";
	const TAKE = 10;
	const SKIP = 0;

	let client: CouponClient;

	beforeEach(() => {
		client = new CouponClient({
			baseUrl: BASE_URL,
			apiKey: API_KEY,
			apiSecret: API_SECRET,
		});
	});

	describe("fetchCoupons", () => {
		it("should hit fetch coupons api and return defined result", async () => {
			const result = await client.fetchCoupons(
				ORGANIZATION_ID,
				STATUS,
				DISCOUNT_TYPE,
				ITEM_EXTERNAL_ID,
				COUPON_NAME,
				TAKE,
				SKIP,
				SORT_BY,
				SORT_ORDER,
				ITEM_CONSTRAINT,
			);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("createCoupon", () => {
		it("should hit create coupon api and return defined result", async () => {
			const request: CreateCouponRequest = {
				"@entity": "org.quicko.qpon.coupon",
				name: COUPON_NAME,
				discount_type: DISCOUNT_TYPE,
				discount_value: DISCOUNT_VALUE,
				item_constraint: ITEM_CONSTRAINT,
			};

			const result = await client.createCoupon(ORGANIZATION_ID, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchCoupon", () => {
		it("should hit fetch coupon api and return defined result", async () => {
			const result = await client.fetchCoupon(ORGANIZATION_ID, COUPON_ID);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("updateCoupon", () => {
		it("should hit update coupon api and return defined result", async () => {
			const request: UpdateCouponRequest = {
				"@entity": "org.quicko.qpon.coupon",
				item_constraint: "specific",
			};

			const result = await client.updateCoupon(ORGANIZATION_ID, COUPON_ID, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("deactivateCoupon", () => {
		it("should hit deactivate coupon api and return defined result", async () => {
			const result = await client.deactivateCoupon(ORGANIZATION_ID, COUPON_ID);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("reactivateCoupon", () => {
		it("should hit reactivate coupon api and return defined result", async () => {
			const result = await client.reactivateCoupon(ORGANIZATION_ID, COUPON_ID);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchCouponsSummary", () => {
		it("should hit fetch coupons summary api and return defined result", async () => {
			const result = await client.fetchCouponsSummary(ORGANIZATION_ID, ACCEPT_JSON, COUPON_ID, TAKE, SKIP);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchCouponSummary", () => {
		it("should hit fetch coupon summary api and return defined result", async () => {
			const result = await client.fetchCouponSummary(ORGANIZATION_ID, COUPON_ID, ACCEPT_JSON, TAKE, SKIP);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("deleteCoupon", () => {
		it("should hit delete coupon api and return defined result", async () => {
			const result = await client.deleteCoupon(ORGANIZATION_ID, COUPON_ID);

			expect(result).toBeDefined();
		}, 30000);
	});
});
