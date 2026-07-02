import { beforeEach, describe, expect, it } from "vitest";
import { RedemptionClient } from "../clients/RedemptionClient";
import type { RedeemCouponCodeRequest } from "../schemas/redemption/redeem-coupon-code/RedeemCouponCodeRequest";

describe("RedemptionClient", () => {
	// Test constants
	const ORGANIZATIONID = "esse eiusmod";
	const ENTITY = "org.quicko.qpon.redemption";
	const DISCOUNT = -39179343;
	const EXTERNAL_ITEM_ID = "incididunt dolore aliqua cillum";
	const EXTERNAL_CUSTOMER_ID = "aliqua ullamco";
	const COUPONID = "exercitation veniam ut Lorem";
	const CAMPAIGNID = "veniam";
	const COUPONCODEID = "nostrud";
	const CUSTOMEREMAIL = "nisi anim";
	const SKIP = 6106320;
	const TAKE = 37909017;

	let client: RedemptionClient;

	beforeEach(() => {
		client = new RedemptionClient({
			baseUrl: "https://api.example.com",
			// token: "your-token",
			// apiKey: "your-apiKey",
			// apiSecret: "your-apiSecret",
		});
	});

	describe("redeemCouponCode", () => {
		it("should hit redeem coupon code api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const request = {
				'@entity': ENTITY,
				'discount': DISCOUNT,
				'external_item_id': EXTERNAL_ITEM_ID,
				'external_customer_id': EXTERNAL_CUSTOMER_ID
			} as RedeemCouponCodeRequest;

			const result = await client.redeemCouponCode(organizationId, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchRedemptions", () => {
		it("should hit fetch redemptions api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;
			const campaignId = CAMPAIGNID;
			const couponCodeId = COUPONCODEID;
			const customerEmail = CUSTOMEREMAIL;
			const skip = SKIP;
			const take = TAKE;
			const acceptType = "aliqua Excepteur commodo voluptate";

			const result = await client.fetchRedemptions(organizationId, couponId, campaignId, couponCodeId, customerEmail, skip, take, acceptType);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchRedemptionsForCouponCode", () => {
		it("should hit fetch redemptions for coupon code api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;
			const campaignId = CAMPAIGNID;
			const couponCodeId = COUPONCODEID;
			const customerEmail = CUSTOMEREMAIL;
			const skip = SKIP;
			const take = TAKE;
			const acceptType = "dolor officia Lorem";

			const result = await client.fetchRedemptionsForCouponCode(organizationId, couponId, campaignId, couponCodeId, customerEmail, skip, take, acceptType);

			expect(result).toBeDefined();
		}, 30000);
	});

});
