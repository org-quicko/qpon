import { beforeEach, describe, expect, it } from "vitest";
import { CustomerClient } from "../clients/CustomerClient";
import type { CreateCustomerRequest } from "../schemas/customer/create-customer/CreateCustomerRequest";
import type { UpdateCustomerRequest } from "../schemas/customer/update-customer/UpdateCustomerRequest";
import type { UpsertCustomerRequest } from "../schemas/customer/upsert-customer/UpsertCustomerRequest";

describe("CustomerClient", () => {
	// Test constants
	const ORGANIZATIONID = "sunt proident";
	const SKIP = "dolor ex Duis dolor et";
	const TAKE = "tempor proident est ea";
	const EMAIL = "sed sint esse labore in";
	const CUSTOMERID = "adipisicing eu commodo dolore cillum";

	let client: CustomerClient;

	beforeEach(() => {
		client = new CustomerClient({
			baseUrl: "https://api.example.com",
			// token: "your-token",
			// apiKey: "your-apiKey",
			// apiSecret: "your-apiSecret",
		});
	});

	describe("fetchCustomers", () => {
		it("should hit fetch customers api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const skip = SKIP;
			const take = TAKE;
			const email = EMAIL;

			const result = await client.fetchCustomers(organizationId, skip, take, email);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("createCustomer", () => {
		it("should hit create customer api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			// TODO: request is a complex type — provide a valid CreateCustomerRequest object here
			const request = {} as CreateCustomerRequest;

			const result = await client.createCustomer(organizationId, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("fetchCustomer", () => {
		it("should hit fetch customer api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const customerId = CUSTOMERID;
			const skip = SKIP;
			const take = TAKE;

			const result = await client.fetchCustomer(organizationId, customerId, skip, take);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("updateCustomer", () => {
		it("should hit update customer api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const customerId = CUSTOMERID;
			// TODO: request is a complex type — provide a valid UpdateCustomerRequest object here
			const request = {} as UpdateCustomerRequest;

			const result = await client.updateCustomer(organizationId, customerId, request);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("deleteCustomer", () => {
		it("should hit delete customer api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			const customerId = CUSTOMERID;

			const result = await client.deleteCustomer(organizationId, customerId);

			expect(result).toBeDefined();
		}, 30000);
	});

	describe("upsertCustomer", () => {
		it("should hit upsert customer api and return defined result", async () => {
			const organizationId = ORGANIZATIONID;
			// TODO: request is a complex type — provide a valid UpsertCustomerRequest object here
			const request = {} as UpsertCustomerRequest;

			const result = await client.upsertCustomer(organizationId, request);

			expect(result).toBeDefined();
		}, 30000);
	});

});
