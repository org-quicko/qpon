import { beforeEach, describe, expect, it } from "vitest";
import { ItemClient } from "../clients/ItemClient";
import type { CreateItemRequest } from "../schemas/item/create-item/CreateItemRequest";
import type { UpdateItemRequest } from "../schemas/item/update-item/UpdateItemRequest";
import type { UpsertItemRequest } from "../schemas/item/upsert-item/UpsertItemRequest";

describe("ItemClient", () => {
	// Test constants
	const ORGANIZATIONID = "Ut veniam sint";
	const SKIP = -68009994;
	const TAKE = -95244606;
	const NAME = "qui veniam ut Lorem";
	const EXTERNALID = "aliquip minim dolore";
	const ENTITY = "org.quicko.qpon.item";
	const DESCRIPTION = "pariatur mollit";
	const CUSTOM_FIELDS = {"est_9":13192609.354869142,"eiusmod59":false,"occaecat18":-45343994.60703762,"price":-78648209};
	const EXTERNAL_ID = "ut cupidatat adipisicing nisi";
	const ITEMID = "laboris id est";
	const UPSERTITEM_ENTITY = "org.quicko.qpon.item";

	let client: ItemClient;

	beforeEach(() => {
		client = new ItemClient({
			baseUrl: "https://api.example.com",
			// token: "your-token",
			// apiKey: "your-apiKey",
			// apiSecret: "your-apiSecret",
		});
	});

	describe("fetchItems", () => {
		it("should hit fetch items api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const skip = SKIP;
			const take = TAKE;
			const name = NAME;
			const externalId = EXTERNALID;

			const result = await client.fetchItems(organizationId, skip, take, name, externalId);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("createItem", () => {
		it("should hit create item api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const request = {
				'@entity': ENTITY,
				'name': NAME,
				'description': DESCRIPTION,
				'custom_fields': CUSTOM_FIELDS,
				'external_id': EXTERNAL_ID
			} as CreateItemRequest;

			const result = await client.createItem(organizationId, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchItem", () => {
		it("should hit fetch item api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const itemId = ITEMID;

			const result = await client.fetchItem(organizationId, itemId);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("updateItem", () => {
		it("should hit update item api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const itemId = ITEMID;
			// TODO: request is a complex type — provide a valid UpdateItemRequest object here
			const request = {} as UpdateItemRequest;

			const result = await client.updateItem(organizationId, itemId, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("deleteItem", () => {
		it("should hit delete item api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const itemId = ITEMID;

			const result = await client.deleteItem(organizationId, itemId);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("upsertItem", () => {
		it("should hit upsert item api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const request = {
				'@entity': UPSERTITEM_ENTITY,
				'name': NAME,
				'description': DESCRIPTION,
				'external_id': EXTERNAL_ID
			} as UpsertItemRequest;

			const result = await client.upsertItem(organizationId, request);

			expect(result).toBeDefined();
		}, 30000);
	});

});
