import { beforeEach, describe, expect, it } from "vitest";
import { CampaignClient } from "../src/campaign/clients/CampaignClient";
import type { CreateCampaignRequest } from "../src/campaign/schemas/campaign/create-campaign/CreateCampaignRequest";
import type { UpdateCampaignRequest } from "../src/campaign/schemas/campaign/update-campaign/UpdateCampaignRequest";

const BASE_URL = process.env.QPON_BASE_URL ?? "";
const API_KEY = process.env.QPON_API_KEY ?? "";
const API_SECRET = process.env.QPON_API_SECRET ?? "";
const ORGANIZATION_ID = process.env.QPON_ORGANIZATION_ID ?? "";

const CONFIGURED = Boolean(BASE_URL && API_KEY && API_SECRET && ORGANIZATION_ID);

describe.skipIf(!CONFIGURED)("CampaignClient", () => {
	const COUPON_ID = process.env.QPON_COUPON_ID ?? "1c9d4f6a-3e57-4b28-9a10-7c5b8d2e4f60";
	const CAMPAIGN_ID = process.env.QPON_CAMPAIGN_ID ?? "5b8e2a71-6c34-4f09-b7d5-2e8a1c460f93";
	const CAMPAIGN_NAME = "Diwali Sale 2026";
	const CAMPAIGN_EXTERNAL_ID = "campaign-diwali-2026";
	const CAMPAIGN_BUDGET = 50000;
	const STATUS = "active";
	const BUDGETED = true;
	const ACCEPT_JSON = "application/json";
	const TAKE = 10;
	const SKIP = 0;

	let client: CampaignClient;

	beforeEach(() => {
		client = new CampaignClient({
			baseUrl: BASE_URL,
			apiKey: API_KEY,
			apiSecret: API_SECRET,
		});
	});

	describe("fetchCampaigns", () => {
		it("should hit fetch campaigns api and return defined result", async () => {
			const result = await client.fetchCampaigns(ORGANIZATION_ID, COUPON_ID, STATUS, BUDGETED, TAKE, SKIP);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("createCampaign", () => {
		it("should hit create campaign api and return defined result", async () => {
			const request: CreateCampaignRequest = {
				"@entity": "org.quicko.qpon.campaign",
				name: CAMPAIGN_NAME,
				external_id: CAMPAIGN_EXTERNAL_ID,
			};

			const result = await client.createCampaign(ORGANIZATION_ID, COUPON_ID, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchCampaign", () => {
		it("should hit fetch campaign api and return defined result", async () => {
			const result = await client.fetchCampaign(ORGANIZATION_ID, COUPON_ID, CAMPAIGN_ID);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("updateCampaign", () => {
		it("should hit update campaign api and return defined result", async () => {
			const request: UpdateCampaignRequest = {
				"@entity": "org.quicko.qpon.campaign",
				budget: CAMPAIGN_BUDGET,
			};

			const result = await client.updateCampaign(ORGANIZATION_ID, COUPON_ID, CAMPAIGN_ID, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("deactivateCampaign", () => {
		it("should hit deactivate campaign api and return defined result", async () => {
			const result = await client.deactivateCampaign(ORGANIZATION_ID, COUPON_ID, CAMPAIGN_ID);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("reactivateCampaign", () => {
		it("should hit reactivate campaign api and return defined result", async () => {
			const result = await client.reactivateCampaign(ORGANIZATION_ID, COUPON_ID, CAMPAIGN_ID);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchCampaignsSummary", () => {
		it("should hit fetch campaigns summary api and return defined result", async () => {
			const result = await client.fetchCampaignsSummary(ORGANIZATION_ID, COUPON_ID, TAKE, SKIP, ACCEPT_JSON);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchCampaignSummary", () => {
		it("should hit fetch campaign summary api and return defined result", async () => {
			const result = await client.fetchCampaignSummary(ORGANIZATION_ID, COUPON_ID, CAMPAIGN_ID, ACCEPT_JSON);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("deleteCampaign", () => {
		it("should hit delete campaign api and return defined result", async () => {
			const result = await client.deleteCampaign(ORGANIZATION_ID, COUPON_ID, CAMPAIGN_ID);

			expect(result).toBeDefined();
		}, 30000);
	});
});
