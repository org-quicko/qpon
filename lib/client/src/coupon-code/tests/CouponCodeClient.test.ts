import { beforeEach, describe, expect, it } from "vitest";
import { CouponCodeClient } from "../clients/CouponCodeClient";
import type { CreateCouponCodeRequest } from "../schemas/coupon-code/create-coupon-code/CreateCouponCodeRequest";
import type { UpdateCouponCodeRequest } from "../schemas/coupon-code/update-coupon-code/UpdateCouponCodeRequest";
import type { DeactivateCouponCodeRequest } from "../schemas/coupon-code/deactivate-coupon-code/DeactivateCouponCodeRequest";
import type { ReactivateCouponCodeRequest } from "../schemas/coupon-code/reactivate-coupon-code/ReactivateCouponCodeRequest";

describe("CouponCodeClient", () => {
	// Test constants
	const ORGANIZATIONID = "sit";
	const COUPONID = "non voluptate sint nisi Ut";
	const CAMPAIGNID = "ullamco sunt dolor commodo voluptate";
	const STATUS = "laboris";
	const VISIBILITY = "laborum aliqua";
	const EXTERNALCUSTOMERID = "mollit";
	const TAKE = 10039849;
	const SKIP = -2135681;
	const ENTITY = "org.quicko.qpon.coupon_code";
	const CODE = "est voluptate et ullamco enim";
	const DURATION_TYPE = "Ut aute";
	const EXPIRES_AT = "1913-09-09T11:27:19.0Z";
	const CUSTOMER_CONSTRAINT = "laboris velit et eiusmod Ut";
	const MAX_REDEMPTIONS = 43103411;
	const COUPONCODEID = "do ad laboris veniam cupidatat";
	const CUSTOMERID = "qui quis in sed Ut";

	let client: CouponCodeClient;

	beforeEach(() => {
		client = new CouponCodeClient({
			baseUrl: "https://api.example.com",
			// token: "your-token",
			// apiKey: "your-apiKey",
			// apiSecret: "your-apiSecret",
		});
	});

	describe("fetchCouponCodes", () => {
		it("should hit fetch coupon codes api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;
			const campaignId = CAMPAIGNID;
			const status = STATUS;
			const visibility = VISIBILITY;
			const externalCustomerId = EXTERNALCUSTOMERID;
			const take = TAKE;
			const skip = SKIP;

			const result = await client.fetchCouponCodes(organizationId, couponId, campaignId, status, visibility, externalCustomerId, take, skip);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("createCouponCode", () => {
		it("should hit create coupon code api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;
			const campaignId = CAMPAIGNID;
			const request = {
				'@entity': ENTITY,
				'code': CODE,
				'visibility': VISIBILITY,
				'duration_type': DURATION_TYPE,
				'expires_at': EXPIRES_AT,
				'customer_constraint': CUSTOMER_CONSTRAINT,
				'max_redemptions': MAX_REDEMPTIONS
			} as CreateCouponCodeRequest;

			const result = await client.createCouponCode(organizationId, couponId, campaignId, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchCouponCode", () => {
		it("should hit fetch coupon code api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;
			const campaignId = CAMPAIGNID;
			const couponCodeId = COUPONCODEID;

			const result = await client.fetchCouponCode(organizationId, couponId, campaignId, couponCodeId);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("updateCouponCode", () => {
		it("should hit update coupon code api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;
			const campaignId = CAMPAIGNID;
			const couponCodeId = COUPONCODEID;
			// TODO: request is a complex type — provide a valid UpdateCouponCodeRequest object here
			const request = {} as UpdateCouponCodeRequest;

			const result = await client.updateCouponCode(organizationId, couponId, campaignId, couponCodeId, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("deleteCouponCode", () => {
		it("should hit delete coupon code api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;
			const campaignId = CAMPAIGNID;
			const couponCodeId = COUPONCODEID;

			const result = await client.deleteCouponCode(organizationId, couponId, campaignId, couponCodeId);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchCouponCodeByCode", () => {
		it("should hit fetch coupon code by code api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const code = CODE;
			const status = STATUS;
			const customerId = CUSTOMERID;
			const take = TAKE;
			const skip = SKIP;
			const acceptType = "irure ipsum amet";

			const result = await client.fetchCouponCodeByCode(organizationId, code, status, customerId, take, skip, acceptType);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("deactivateCouponCode", () => {
		it("should hit deactivate coupon code api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;
			const campaignId = CAMPAIGNID;
			const couponCodeId = COUPONCODEID;
			// TODO: request is a complex type — provide a valid DeactivateCouponCodeRequest object here
			const request = {} as DeactivateCouponCodeRequest;

			const result = await client.deactivateCouponCode(organizationId, couponId, campaignId, couponCodeId, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("reactivateCouponCode", () => {
		it("should hit reactivate coupon code api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;
			const campaignId = CAMPAIGNID;
			const couponCodeId = COUPONCODEID;
			// TODO: request is a complex type — provide a valid ReactivateCouponCodeRequest object here
			const request = {} as ReactivateCouponCodeRequest;

			const result = await client.reactivateCouponCode(organizationId, couponId, campaignId, couponCodeId, request);

			expect(result).toBeDefined();
		}, 30000);
	});

});
