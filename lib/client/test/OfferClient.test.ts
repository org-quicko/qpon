import { beforeEach, describe, expect, it } from "vitest";
import { OfferClient } from "../src/offers/clients/OfferClient";

const BASE_URL = process.env.QPON_BASE_URL ?? "";
const API_KEY = process.env.QPON_API_KEY ?? "";
const API_SECRET = process.env.QPON_API_SECRET ?? "";
const ORGANIZATION_ID = process.env.QPON_ORGANIZATION_ID ?? "";

const CONFIGURED = Boolean(BASE_URL && API_KEY && API_SECRET && ORGANIZATION_ID);

describe.skipIf(!CONFIGURED)("OfferClient", () => {
	const COUPON_CODE = process.env.QPON_COUPON_CODE ?? "FESTIVE10";
	const ITEM_EXTERNAL_ID = process.env.QPON_ITEM_EXTERNAL_ID ?? "sku-1001";
	const CUSTOMER_EXTERNAL_ID = process.env.QPON_CUSTOMER_EXTERNAL_ID ?? "customer-1001";
	const DISCOUNT_TYPE = "fixed";
	const SORT = "discount_value";
	const ACCEPT_SHEET_JSON = "application/json;format=sheet-json";
	const TAKE = 10;
	const SKIP = 0;

	let client: OfferClient;

	beforeEach(() => {
		client = new OfferClient({
			baseUrl: BASE_URL,
			apiKey: API_KEY,
			apiSecret: API_SECRET,
		});
	});

	describe("fetchOffers", () => {
		it("should hit fetch offers api and return defined result", async () => {
			const result = await client.fetchOffers(
				ORGANIZATION_ID,
				ITEM_EXTERNAL_ID,
				CUSTOMER_EXTERNAL_ID,
				SORT,
				DISCOUNT_TYPE,
				SKIP,
				TAKE,
				ACCEPT_SHEET_JSON,
			);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchOffer", () => {
		it("should hit fetch offer api and return defined result", async () => {
			const result = await client.fetchOffer(
				ORGANIZATION_ID,
				CUSTOMER_EXTERNAL_ID,
				COUPON_CODE,
				ITEM_EXTERNAL_ID,
				ACCEPT_SHEET_JSON,
			);

			expect(result).toBeDefined();
		}, 30000);
	});
});
