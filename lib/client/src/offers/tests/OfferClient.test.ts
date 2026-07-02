import { beforeEach, describe, expect, it } from "vitest";
import { OfferClient } from "../clients/OfferClient";

describe("OfferClient", () => {
	// Test constants
	const ORGANIZATIONID = "et sed pariatur cupidatat ad";
	const EXTERNALCUSTOMERID = "incididunt";
	const CODE = "elit Lorem";
	const EXTERNALITEMID = -71723925;
	const SORT = "deserunt ad officia in aliquip";
	const DISCOUNTTYPE = "proident";
	const SKIP = 20736785;
	const TAKE = -64726207;

	let client: OfferClient;

	beforeEach(() => {
		client = new OfferClient({
			baseUrl: "https://api.example.com",
			// token: "your-token",
			// apiKey: "your-apiKey",
			// apiSecret: "your-apiSecret",
		});
	});

	describe("fetchOffer", () => {
		it("should hit fetch offer api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const externalCustomerId = EXTERNALCUSTOMERID;
			const code = CODE;
			const externalItemId = EXTERNALITEMID;
			const acceptType = "reprehenderit sed consequat ipsum";

			const result = await client.fetchOffer(organizationId, externalCustomerId, code, externalItemId, acceptType);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchOffers", () => {
		it("should hit fetch offers api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const externalItemId = EXTERNALITEMID;
			const externalCustomerId = EXTERNALCUSTOMERID;
			const sort = SORT;
			const discountType = DISCOUNTTYPE;
			const skip = SKIP;
			const take = TAKE;
			const acceptType = "occaecat nulla irure aute Ut";

			const result = await client.fetchOffers(organizationId, externalItemId, externalCustomerId, sort, discountType, skip, take, acceptType);

			expect(result).toBeDefined();
		}, 30000);
	});

});
