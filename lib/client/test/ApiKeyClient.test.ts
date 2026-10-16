import { beforeEach, describe, expect, it } from "vitest";
import { ApiKeyClient } from "../src/api-key/clients/ApiKeyClient";

const BASE_URL = process.env.QPON_BASE_URL ?? "";
const API_KEY = process.env.QPON_API_KEY ?? "";
const API_SECRET = process.env.QPON_API_SECRET ?? "";
const ORGANIZATION_ID = process.env.QPON_ORGANIZATION_ID ?? "";

const CONFIGURED = Boolean(BASE_URL && API_KEY && API_SECRET && ORGANIZATION_ID);

describe.skipIf(!CONFIGURED)("ApiKeyClient", () => {
	let client: ApiKeyClient;

	beforeEach(() => {
		client = new ApiKeyClient({
			baseUrl: BASE_URL,
			apiKey: API_KEY,
			apiSecret: API_SECRET,
		});
	});

	describe("fetchApiKey", () => {
		it("should hit fetch api key api and return defined result", async () => {
			const result = await client.fetchApiKey(ORGANIZATION_ID);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("createApiKey", () => {
		it("should hit create api key api and return defined result", async () => {
			const result = await client.createApiKey(ORGANIZATION_ID);

			expect(result).toBeDefined();
		}, 30000);
	});
});
