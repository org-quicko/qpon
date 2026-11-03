import { beforeEach, describe, expect, it } from "vitest";
import { ItemClient } from "../src/item/clients/ItemClient";
import type { CreateItemRequest } from "../src/item/schemas/item/create-item/CreateItemRequest";
import type { UpdateItemRequest } from "../src/item/schemas/item/update-item/UpdateItemRequest";
import type { UpsertItemRequest } from "../src/item/schemas/item/upsert-item/UpsertItemRequest";

const BASE_URL = process.env.QPON_BASE_URL ?? "";
const API_KEY = process.env.QPON_API_KEY ?? "";
const API_SECRET = process.env.QPON_API_SECRET ?? "";
const ORGANIZATION_ID = process.env.QPON_ORGANIZATION_ID ?? "";

const CONFIGURED = Boolean(BASE_URL && API_KEY && API_SECRET && ORGANIZATION_ID);

describe.skipIf(!CONFIGURED)("ItemClient", () => {
	const ITEM_ID = process.env.QPON_ITEM_ID ?? "7e4a9c26-5d81-4b73-a0f6-8c2e1d5b3a94";
	const ITEM_EXTERNAL_ID = process.env.QPON_ITEM_EXTERNAL_ID ?? "sku-1001";
	const ITEM_NAME = "Wireless Headphones";
	const ITEM_DESCRIPTION = "Over-ear wireless headphones with active noise cancellation";
	const TAKE = 10;
	const SKIP = 0;

	let client: ItemClient;

	beforeEach(() => {
		client = new ItemClient({
			baseUrl: BASE_URL,
			apiKey: API_KEY,
			apiSecret: API_SECRET,
		});
	});

	describe("fetchItems", () => {
		it("should hit fetch items api and return defined result", async () => {
			const result = await client.fetchItems(ORGANIZATION_ID, SKIP, TAKE, ITEM_NAME, ITEM_EXTERNAL_ID);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("createItem", () => {
		it("should hit create item api and return defined result", async () => {
			const request: CreateItemRequest = {
				"@entity": "org.quicko.qpon.item",
				name: ITEM_NAME,
				description: ITEM_DESCRIPTION,
				external_id: ITEM_EXTERNAL_ID,
			};

			const result = await client.createItem(ORGANIZATION_ID, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchItem", () => {
		it("should hit fetch item api and return defined result", async () => {
			const result = await client.fetchItem(ORGANIZATION_ID, ITEM_ID);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("updateItem", () => {
		it("should hit update item api and return defined result", async () => {
			const request: UpdateItemRequest = {
				"@entity": "org.quicko.qpon.item",
				name: `${ITEM_NAME} (Refreshed)`,
			};

			const result = await client.updateItem(ORGANIZATION_ID, ITEM_ID, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("upsertItem", () => {
		it("should hit upsert item api and return defined result", async () => {
			const request: UpsertItemRequest = {
				"@entity": "org.quicko.qpon.item",
				name: ITEM_NAME,
				description: ITEM_DESCRIPTION,
				external_id: ITEM_EXTERNAL_ID,
			};

			const result = await client.upsertItem(ORGANIZATION_ID, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("deleteItem", () => {
		it("should hit delete item api and return defined result", async () => {
			const result = await client.deleteItem(ORGANIZATION_ID, ITEM_ID);

			expect(result).toBeDefined();
		}, 30000);
	});
});
