import { beforeEach, describe, expect, it } from "vitest";
import { RedemptionClient } from "../src/redemption/clients/RedemptionClient";
import type { RedeemCouponCodeRequest } from "../src/redemption/schemas/redemption/redeem-coupon-code/RedeemCouponCodeRequest";

const BASE_URL = process.env.QPON_BASE_URL ?? "";
const API_KEY = process.env.QPON_API_KEY ?? "";
const API_SECRET = process.env.QPON_API_SECRET ?? "";
const ORGANIZATION_ID = process.env.QPON_ORGANIZATION_ID ?? "";

const CONFIGURED = Boolean(BASE_URL && API_KEY && API_SECRET && ORGANIZATION_ID);

describe.skipIf(!CONFIGURED)("RedemptionClient", () => {
	const COUPON_ID = process.env.QPON_COUPON_ID ?? "1c9d4f6a-3e57-4b28-9a10-7c5b8d2e4f60";
	const CAMPAIGN_ID = process.env.QPON_CAMPAIGN_ID ?? "5b8e2a71-6c34-4f09-b7d5-2e8a1c460f93";
	const COUPON_CODE_ID = process.env.QPON_COUPON_CODE_ID ?? "9d3f7b04-1a62-4e85-8c07-3b9d5f2a6e18";
	const COUPON_CODE = process.env.QPON_COUPON_CODE ?? "FESTIVE10";
	const ITEM_EXTERNAL_ID = process.env.QPON_ITEM_EXTERNAL_ID ?? "sku-1001";
	const CUSTOMER_EXTERNAL_ID = process.env.QPON_CUSTOMER_EXTERNAL_ID ?? "customer-1001";
	const CUSTOMER_EMAIL = process.env.QPON_CUSTOMER_EMAIL ?? "rahul.mehta@example.com";
	const BASE_ORDER_VALUE = 1000;
	const DISCOUNT = 10;
	const ACCEPT_SHEET_JSON = "application/json;format=sheet-json";
	const TAKE = 10;
	const SKIP = 0;

	let client: RedemptionClient;

	beforeEach(() => {
		client = new RedemptionClient({
			baseUrl: BASE_URL,
			apiKey: API_KEY,
			apiSecret: API_SECRET,
		});
	});

	describe("redeemCouponCode", () => {
		it("should hit redeem coupon code api and return defined result", async () => {
			const request: RedeemCouponCodeRequest = {
				"@entity": "org.quicko.qpon.redemption",
				code: COUPON_CODE,
				base_order_value: BASE_ORDER_VALUE,
				discount: DISCOUNT,
				external_item_id: ITEM_EXTERNAL_ID,
				external_customer_id: CUSTOMER_EXTERNAL_ID,
			};

			const result = await client.redeemCouponCode(ORGANIZATION_ID, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchRedemptions", () => {
		it("should hit fetch redemptions api and return defined result", async () => {
			const result = await client.fetchRedemptions(
				ORGANIZATION_ID,
				COUPON_ID,
				CAMPAIGN_ID,
				COUPON_CODE_ID,
				CUSTOMER_EMAIL,
				SKIP,
				TAKE,
				ACCEPT_SHEET_JSON,
			);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchRedemptionsForCouponCode", () => {
		it("should hit fetch redemptions for coupon code api and return defined result", async () => {
			const result = await client.fetchRedemptionsForCouponCode(
				ORGANIZATION_ID,
				COUPON_ID,
				CAMPAIGN_ID,
				COUPON_CODE_ID,
				CUSTOMER_EMAIL,
				SKIP,
				TAKE,
				ACCEPT_SHEET_JSON,
			);

			expect(result).toBeDefined();
		}, 30000);
	});
});
