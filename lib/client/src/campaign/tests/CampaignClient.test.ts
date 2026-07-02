import { beforeEach, describe, expect, it } from "vitest";
import { CampaignClient } from "../clients/CampaignClient";
import type { CreateCampaignRequest } from "../schemas/campaign/create-campaign/CreateCampaignRequest";
import type { UpdateCampaignRequest } from "../schemas/campaign/update-campaign/UpdateCampaignRequest";

describe("CampaignClient", () => {
	// Test constants
	const ORGANIZATIONID = "minim";
	const COUPONID = "magna velit aute id";
	const STATUS = "in et aliqua enim incididunt";
	const BUDGETED = true;
	const TAKE = -57045491;
	const SKIP = -82965881;
	const ENTITY = "org.quicko.qpon.campaign";
	const CAMPAIGNID = "dolore nostrud";
	const UPDATECAMPAIGN_ENTITY = "org.quicko.qpon.campaign";

	let client: CampaignClient;

	beforeEach(() => {
		client = new CampaignClient({
			baseUrl: "https://api.example.com",
			// token: "your-token",
			// apiKey: "your-apiKey",
			// apiSecret: "your-apiSecret",
		});
	});

	describe("fetchCampaigns", () => {
		it("should hit fetch campaigns api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;
			const status = STATUS;
			const budgeted = BUDGETED;
			const take = TAKE;
			const skip = SKIP;

			const result = await client.fetchCampaigns(organizationId, couponId, status, budgeted, take, skip);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("createCampaign", () => {
		it("should hit create campaign api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;
			const request = {
				'@entity': ENTITY
			} as CreateCampaignRequest;

			const result = await client.createCampaign(organizationId, couponId, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchCampaign", () => {
		it("should hit fetch campaign api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;
			const campaignId = CAMPAIGNID;

			const result = await client.fetchCampaign(organizationId, couponId, campaignId);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("updateCampaign", () => {
		it("should hit update campaign api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;
			const campaignId = CAMPAIGNID;
			const request = {
				'@entity': UPDATECAMPAIGN_ENTITY
			} as UpdateCampaignRequest;

			const result = await client.updateCampaign(organizationId, couponId, campaignId, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("deleteCampaign", () => {
		it("should hit delete campaign api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;
			const campaignId = CAMPAIGNID;

			const result = await client.deleteCampaign(organizationId, couponId, campaignId);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("deactivateCampaign", () => {
		it("should hit deactivate campaign api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;
			const campaignId = CAMPAIGNID;

			const result = await client.deactivateCampaign(organizationId, couponId, campaignId);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("reactivateCampaign", () => {
		it("should hit reactivate campaign api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;
			const campaignId = CAMPAIGNID;

			const result = await client.reactivateCampaign(organizationId, couponId, campaignId);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchCampaignsSummary", () => {
		it("should hit fetch campaigns summary api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;
			const take = TAKE;
			const skip = SKIP;
			const acceptType = "sed ad elit ut";

			const result = await client.fetchCampaignsSummary(organizationId, couponId, take, skip, acceptType);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchCampaignSummary", () => {
		it("should hit fetch campaign summary api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;
			const campaignId = CAMPAIGNID;
			const acceptType = "adipisicing ad tempor in";

			const result = await client.fetchCampaignSummary(organizationId, couponId, campaignId, acceptType);

			expect(result).toBeDefined();
		}, 30000);
	});

});
