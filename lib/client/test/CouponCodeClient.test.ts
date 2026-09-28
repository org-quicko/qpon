import { beforeEach, describe, expect, it } from "vitest";
import { CouponCodeClient } from "../src/coupon-code/clients/CouponCodeClient";
import type { CreateCouponCodeRequest } from "../src/coupon-code/schemas/coupon-code/create-coupon-code/CreateCouponCodeRequest";
import type { DeactivateCouponCodeRequest } from "../src/coupon-code/schemas/coupon-code/deactivate-coupon-code/DeactivateCouponCodeRequest";
import type { ReactivateCouponCodeRequest } from "../src/coupon-code/schemas/coupon-code/reactivate-coupon-code/ReactivateCouponCodeRequest";
import type { UpdateCouponCodeRequest } from "../src/coupon-code/schemas/coupon-code/update-coupon-code/UpdateCouponCodeRequest";

const BASE_URL = process.env.QPON_BASE_URL ?? "";
const API_KEY = process.env.QPON_API_KEY ?? "";
const API_SECRET = process.env.QPON_API_SECRET ?? "";
const ORGANIZATION_ID = process.env.QPON_ORGANIZATION_ID ?? "";

const CONFIGURED = Boolean(BASE_URL && API_KEY && API_SECRET && ORGANIZATION_ID);

describe.skipIf(!CONFIGURED)("CouponCodeClient", () => {
	const COUPON_ID = process.env.QPON_COUPON_ID ?? "1c9d4f6a-3e57-4b28-9a10-7c5b8d2e4f60";
	const CAMPAIGN_ID = process.env.QPON_CAMPAIGN_ID ?? "5b8e2a71-6c34-4f09-b7d5-2e8a1c460f93";
	const COUPON_CODE_ID = process.env.QPON_COUPON_CODE_ID ?? "9d3f7b04-1a62-4e85-8c07-3b9d5f2a6e18";
	const COUPON_CODE = process.env.QPON_COUPON_CODE ?? "FESTIVE10";
	const CUSTOMER_EXTERNAL_ID = process.env.QPON_CUSTOMER_EXTERNAL_ID ?? "customer-1001";
	const DESCRIPTION = "Flat 10 off for the festive season";
	const CUSTOMER_CONSTRAINT = "all";
	const DURATION_TYPE = "limited";
	const EXPIRES_AT = "2026-12-31T23:59:59.000Z";
	const MAX_REDEMPTIONS = 100;
	const STATUS = "active" as const;
	const VISIBILITY = "public" as const;
	const ACCEPT_JSON = "application/json";
	const TAKE = 10;
	const SKIP = 0;

	let client: CouponCodeClient;

	beforeEach(() => {
		client = new CouponCodeClient({
			baseUrl: BASE_URL,
			apiKey: API_KEY,
			apiSecret: API_SECRET,
		});
	});

	describe("fetchCouponCodes", () => {
		it("should hit fetch coupon codes api and return defined result", async () => {
			const result = await client.fetchCouponCodes(
				ORGANIZATION_ID,
				COUPON_ID,
				CAMPAIGN_ID,
				STATUS,
				VISIBILITY,
				CUSTOMER_EXTERNAL_ID,
				TAKE,
				SKIP,
			);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("createCouponCode", () => {
		it("should hit create coupon code api and return defined result", async () => {
			const request: CreateCouponCodeRequest = {
				"@entity": "org.quicko.qpon.coupon_code",
				code: COUPON_CODE,
				visibility: VISIBILITY,
				duration_type: DURATION_TYPE,
				expires_at: EXPIRES_AT,
				customer_constraint: CUSTOMER_CONSTRAINT,
				max_redemptions: MAX_REDEMPTIONS,
			};

			const result = await client.createCouponCode(ORGANIZATION_ID, COUPON_ID, CAMPAIGN_ID, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchCouponCode", () => {
		it("should hit fetch coupon code api and return defined result", async () => {
			const result = await client.fetchCouponCode(ORGANIZATION_ID, COUPON_ID, CAMPAIGN_ID, COUPON_CODE_ID);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchCouponCodeByCode", () => {
		it("should hit fetch coupon code by code api and return defined result", async () => {
			const result = await client.fetchCouponCodeByCode(
				ORGANIZATION_ID,
				COUPON_CODE,
				STATUS,
				CUSTOMER_EXTERNAL_ID,
				TAKE,
				SKIP,
				ACCEPT_JSON,
			);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("updateCouponCode", () => {
		it("should hit update coupon code api and return defined result", async () => {
			const request: UpdateCouponCodeRequest = {
				"@entity": "org.quicko.qpon.coupon_code",
				description: DESCRIPTION,
			};

			const result = await client.updateCouponCode(ORGANIZATION_ID, COUPON_ID, CAMPAIGN_ID, COUPON_CODE_ID, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("deactivateCouponCode", () => {
		it("should hit deactivate coupon code api and return defined result", async () => {
			const request: DeactivateCouponCodeRequest = {};

			const result = await client.deactivateCouponCode(ORGANIZATION_ID, COUPON_ID, CAMPAIGN_ID, COUPON_CODE_ID, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("reactivateCouponCode", () => {
		it("should hit reactivate coupon code api and return defined result", async () => {
			const request: ReactivateCouponCodeRequest = {};

			const result = await client.reactivateCouponCode(ORGANIZATION_ID, COUPON_ID, CAMPAIGN_ID, COUPON_CODE_ID, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("deleteCouponCode", () => {
		it("should hit delete coupon code api and return defined result", async () => {
			const result = await client.deleteCouponCode(ORGANIZATION_ID, COUPON_ID, CAMPAIGN_ID, COUPON_CODE_ID);

			expect(result).toBeDefined();
		}, 30000);
	});
});
