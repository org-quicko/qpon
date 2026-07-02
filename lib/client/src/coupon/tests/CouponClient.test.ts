import { beforeEach, describe, expect, it } from "vitest";
import { CouponClient } from "../clients/CouponClient";
import type { CreateCouponRequest } from "../schemas/coupon/create-coupon/CreateCouponRequest";
import type { UpdateCouponRequest } from "../schemas/coupon/update-coupon/UpdateCouponRequest";

describe("CouponClient", () => {
	// Test constants
	const ORGANIZATIONID = "veniam dolore dolor sint";
	const STATUS = "nulla";
	const DISCOUNTTYPE = "ex ut in labore ea";
	const EXTERNALITEMID = "magna ut ullamco velit";
	const NAME = "consectetur incididunt";
	const TAKE = -84722370;
	const SKIP = -81119404;
	const SORTBY = "qui fugiat Ut in elit";
	const SORTORDER = "asc";
	const ITEMCONSTRAINT = "all";
	const ENTITY = "org.quicko.qpon.coupon";
	const DISCOUNT_TYPE = "consectetur occaecat";
	const DISCOUNT_VALUE = 99815866;
	const ITEM_CONSTRAINT = "laborum Ut";
	const COUPONID = "in";
	const UPDATECOUPON_ENTITY = "org.quicko.qpon.coupon";

	let client: CouponClient;

	beforeEach(() => {
		client = new CouponClient({
			baseUrl: "https://api.example.com",
			// token: "your-token",
			// apiKey: "your-apiKey",
			// apiSecret: "your-apiSecret",
		});
	});

	describe("fetchCoupons", () => {
		it("should hit fetch coupons api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const status = STATUS;
			const discountType = DISCOUNTTYPE;
			const externalItemId = EXTERNALITEMID;
			const name = NAME;
			const take = TAKE;
			const skip = SKIP;
			const sortBy = SORTBY;
			const sortOrder = SORTORDER;
			const itemConstraint = ITEMCONSTRAINT;

			const result = await client.fetchCoupons(organizationId, status, discountType, externalItemId, name, take, skip, sortBy, sortOrder, itemConstraint);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("createCoupon", () => {
		it("should hit create coupon api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const request = {
				'@entity': ENTITY,
				'discount_type': DISCOUNT_TYPE,
				'discount_value': DISCOUNT_VALUE,
				'item_constraint': ITEM_CONSTRAINT
			} as CreateCouponRequest;

			const result = await client.createCoupon(organizationId, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchCoupon", () => {
		it("should hit fetch coupon api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;

			const result = await client.fetchCoupon(organizationId, couponId);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("updateCoupon", () => {
		it("should hit update coupon api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;
			const request = {
				'@entity': UPDATECOUPON_ENTITY,
				'item_constraint': ITEM_CONSTRAINT
			} as UpdateCouponRequest;

			const result = await client.updateCoupon(organizationId, couponId, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("deleteCoupon", () => {
		it("should hit delete coupon api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;

			const result = await client.deleteCoupon(organizationId, couponId);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("deactivateCoupon", () => {
		it("should hit deactivate coupon api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;

			const result = await client.deactivateCoupon(organizationId, couponId);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("reactivateCoupon", () => {
		it("should hit reactivate coupon api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;

			const result = await client.reactivateCoupon(organizationId, couponId);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchCouponsSummary", () => {
		it("should hit fetch coupons summary api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const acceptType = "culpa officia";
			const couponId = COUPONID;
			const take = TAKE;
			const skip = SKIP;

			const result = await client.fetchCouponsSummary(organizationId, acceptType, couponId, take, skip);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchCouponSummary", () => {
		it("should hit fetch coupon summary api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const couponId = COUPONID;
			const acceptType = "sed dolore sint irure";
			const take = TAKE;
			const skip = SKIP;

			const result = await client.fetchCouponSummary(organizationId, couponId, acceptType, take, skip);

			expect(result).toBeDefined();
		}, 30000);
	});

});
