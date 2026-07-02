import { beforeEach, describe, expect, it } from "vitest";
import { ApiKeyClient } from "../clients/ApiKeyClient";

describe("ApiKeyClient", () => {
	// Test constants
	const ORGANIZATIONID = "Excepteur pariatur id commodo cillum";

	let client: ApiKeyClient;

	beforeEach(() => {
		client = new ApiKeyClient({
			baseUrl: "https://api.example.com",
			// token: "your-token",
			// apiKey: "your-apiKey",
			// apiSecret: "your-apiSecret",
		});
	});

	describe("fetchApiKey", () => {
		it("should hit fetch api key api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;

			const result = await client.fetchApiKey(organizationId);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("createApiKey", () => {
		it("should hit create api key api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;

			const result = await client.createApiKey(organizationId);

			expect(result).toBeDefined();
		}, 30000);
	});

});
