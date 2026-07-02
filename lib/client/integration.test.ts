import { Qpon } from "./Qpon";
import { QponCredentials } from "./QponCredentials";
import { ApiError } from "./index";
import type { BeforeRequestInterceptor, AfterResponseInterceptor } from "./src/organization/interceptors/types";
import type { InternalAxiosRequestConfig, AxiosResponse } from "axios";

const API_KEY = "5ef6efcfa43b076eeefe87404fe780e8";
const API_SECRET = "ecbcd5db3b05bd6a8e5d3a939785c7c15db1476832e498dd7b2a2cf3e45667bb";
const ORG = "7235550b-f42d-4523-8f6c-90bffc4efd36";
const BASE_URL = "http://localhost:5000";

const logRequest: BeforeRequestInterceptor = {
	beforeRequest(config: InternalAxiosRequestConfig) {
		const url = `${config.baseURL ?? ""}${config.url ?? ""}`;
		const params = config.params ? `?${new URLSearchParams(config.params).toString()}` : "";
		console.log(`\n→ ${(config.method ?? "GET").toUpperCase()} ${url}${params}`);
		if (config.data) console.log("  body:", typeof config.data === "string" ? config.data : JSON.stringify(config.data, null, 2));
		return config;
	},
};

const logResponse: AfterResponseInterceptor = {
	afterResponse(response: AxiosResponse) {
		console.log(`← ${response.status} ${JSON.stringify(response.data, null, 2)}`);
		return response;
	},
};

const qpon = new Qpon(new QponCredentials(API_KEY, API_SECRET), BASE_URL, [logRequest], [logResponse]);

type Row = { name: string; ok: boolean; status?: number; note?: string };
const rows: Row[] = [];

async function step<T>(name: string, fn: () => Promise<T>, capture?: (r: T) => void): Promise<void> {
	try {
		const r = await fn();
		if (capture) capture(r);
		rows.push({ name, ok: true, status: 200 });
	} catch (e) {
		if (e instanceof ApiError) rows.push({ name, ok: false, status: e.statusCode, note: JSON.stringify(e.body)?.slice(0, 80) });
		else rows.push({ name, ok: false, note: (e as Error).message?.slice(0, 80) });
	}
}

async function main() {
	const tag = `it-${Date.now()}`;
	let couponId = "ab31a81c-7290-4c36-b350-2f7d3d2ede71", campaignId = "", couponCodeId = "", itemId = "", customerId = "";

	await step("ORGANIZATIONS.fetchOrganization", () => qpon.ORGANIZATIONS.fetchOrganization(ORG!));
	await step("COUPONS.fetchCoupons", () => qpon.COUPONS.fetchCoupons(ORG!));
	await step("COUPONS.fetchCouponsSummary", () => qpon.COUPONS.fetchCouponsSummary(ORG!, "application/json"));
	await step("ITEM.fetchItems", () => qpon.ITEM.fetchItems(ORG!));
	await step("CUSTOMERS.fetchCustomers", () => qpon.CUSTOMERS.fetchCustomers(ORG!));
	await step("OFFERS.fetchOffers", () => qpon.OFFERS.fetchOffers(ORG!));
	await step("REDEMPTIONS.fetchRedemptions", () => qpon.REDEMPTIONS.fetchRedemptions(ORG!));

	await step("COUPONS.createCoupon", () => qpon.COUPONS.createCoupon(ORG!, { "@entity": "org.quicko.qpon.coupon", name: `coupon-${tag}`, discount_type: "fixed", discount_value: 10, item_constraint: "all" } as any), (r: any) => { couponId = r?.data?.coupon_id; });
	await step("COUPONS.fetchCoupon", () => qpon.COUPONS.fetchCoupon(ORG!, couponId));
	await step("COUPONS.updateCoupon", () => qpon.COUPONS.updateCoupon(ORG!, couponId, { "@entity": "org.quicko.qpon.coupon", name: `coupon-${tag}-upd` } as any));

	await step("ITEM.createItem", () => qpon.ITEM.createItem(ORG!, { "@entity": "org.quicko.qpon.item", name: `item-${tag}`, external_id: `ext-${tag}` } as any), (r: any) => { itemId = r?.data?.item_id; });
	await step("ITEM.fetchItem", () => qpon.ITEM.fetchItem(ORG!, itemId));
	await step("ITEM.updateItem", () => qpon.ITEM.updateItem(ORG!, itemId, { "@entity": "org.quicko.qpon.item", name: `item-${tag}-upd` } as any));
	await step("ITEM.upsertItem", () => qpon.ITEM.upsertItem(ORG!, { "@entity": "org.quicko.qpon.item", name: `item-${tag}`, external_id: `ext-${tag}` } as any));

	await step("COUPONITEM.fetchCouponItems", () => qpon.COUPONITEM.fetchCouponItems(ORG!, couponId));
	await step("COUPONITEM.addItems", () => qpon.COUPONITEM.addItems(ORG!, couponId, { "@entity": "org.quicko.qpon.coupon_item", items: [itemId] } as any));
	await step("COUPONITEM.fetchCouponItems [external_id present]", () => qpon.COUPONITEM.fetchCouponItems(ORG!, couponId), (r: any) => {
		const first = r?.data?.items?.find((i: any) => i?.item_id === itemId) ?? r?.data?.items?.[0];
		console.log("  fetched coupon item external_id:", first?.external_id);
		if (!first) throw new Error("no items returned from fetchCouponItems");
		if (first.external_id == null) throw new Error("external_id MISSING on fetched coupon item");
	});

	await step("CAMPAIGN.createCampaign", () => qpon.CAMPAIGN.createCampaign(ORG!, couponId, { "@entity": "org.quicko.qpon.campaign", name: `camp-${tag}`, budget: 1000 } as any), (r: any) => { campaignId = r?.data?.campaign_id; });
	await step("CAMPAIGN.fetchCampaigns", () => qpon.CAMPAIGN.fetchCampaigns(ORG!, couponId));
	await step("CAMPAIGN.fetchCampaign", () => qpon.CAMPAIGN.fetchCampaign(ORG!, couponId, campaignId));
	await step("CAMPAIGN.updateCampaign", () => qpon.CAMPAIGN.updateCampaign(ORG!, couponId, campaignId, { "@entity": "org.quicko.qpon.campaign", name: `camp-${tag}-upd` } as any));

	await step("COUPONCODE.createCouponCode", () => qpon.COUPONCODE.createCouponCode(ORG!, couponId, campaignId, { "@entity": "org.quicko.qpon.coupon_code", code: `CODE-${tag}`, customer_constraint: "all", max_redemptions: 100, minimum_amount: 0, max_redemption_per_customer: 1, visibility: "public", duration_type: "forever" } as any), (r: any) => { couponCodeId = r?.data?.coupon_code_id; });
	await step("COUPONCODE.fetchCouponCodes", () => qpon.COUPONCODE.fetchCouponCodes(ORG!, couponId, campaignId));
	await step("COUPONCODE.fetchCouponCode", () => qpon.COUPONCODE.fetchCouponCode(ORG!, couponId, campaignId, couponCodeId));
	await step("COUPONCODE.updateCouponCode", () => qpon.COUPONCODE.updateCouponCode(ORG!, couponId, campaignId, couponCodeId, { "@entity": "org.quicko.qpon.coupon_code", description: "updated" } as any));

	await step("CUSTOMERS.createCustomer", () => qpon.CUSTOMERS.createCustomer(ORG!, { "@entity": "org.quicko.qpon.customer", name: `cust-${tag}`, email: `${tag}@x.com`, isd_code: "+91", phone: "9999999999", external_id: `cust-${tag}` } as any), (r: any) => { customerId = r?.data?.customer_id; });
	await step("CUSTOMERS.fetchCustomer", () => qpon.CUSTOMERS.fetchCustomer(ORG!, customerId));
	await step("CUSTOMERS.updateCustomer", () => qpon.CUSTOMERS.updateCustomer(ORG!, customerId, { "@entity": "org.quicko.qpon.customer", name: `cust-${tag}-upd` } as any));

	await step("CUSTOMERCOUPONCODE.addCustomers", () => qpon.CUSTOMERCOUPONCODE.addCustomers(couponId, campaignId, couponCodeId, { "@entity": "org.quicko.qpon.customer_coupon_code", customers: [customerId] } as any));
	await step("CUSTOMERCOUPONCODE.fetchCustomersForCouponCode [external_id present]", () => qpon.CUSTOMERCOUPONCODE.fetchCustomersForCouponCode(couponId, campaignId, couponCodeId), (r: any) => {
		const first = r?.data?.items?.find((c: any) => c?.customer_id === customerId) ?? r?.data?.items?.[0];
		console.log("  fetched customer external_id:", first?.external_id);
		if (!first) throw new Error("no customers returned from fetchCustomersForCouponCode");
		if (first.external_id == null) throw new Error("external_id MISSING on fetched customer");
	});

	await step("REDEMPTIONS.fetchRedemptionsForCouponCode", () => qpon.REDEMPTIONS.fetchRedemptionsForCouponCode(ORG!, couponId, campaignId, couponCodeId));

	// Offers: verify the sheet workbook comes back and external_item_id filter accepts a STRING
	await step("OFFERS.fetchOffers [sheet-json]", () => qpon.OFFERS.fetchOffers(ORG!, undefined, undefined, undefined, undefined, 0, 10, "application/json;format=sheet-json"), (r: any) => {
		const wb = r?.data;
		console.log("  offers workbook @entity:", wb?.["@entity"], "| sheets:", wb?.sheets?.length);
		if (wb?.["@entity"] !== "workbook") throw new Error("offers response is not a workbook");
	});
	await step("OFFERS.fetchOffers [external_item_id=string]", () => qpon.OFFERS.fetchOffers(ORG!, `ext-${tag}`, undefined, undefined, undefined, 0, 10, "application/json;format=sheet-json"));
	await step("OFFERS.fetchOffer [by code]", () => qpon.OFFERS.fetchOffer(ORG!, undefined, `CODE-${tag}`, undefined, "application/json;format=sheet-json"));

	// Redemption: redeem the public coupon code (customer + item external ids must exist)
	await step("REDEMPTIONS.redeemCouponCode", () => qpon.REDEMPTIONS.redeemCouponCode(ORG!, { "@entity": "org.quicko.qpon.redemption", code: `CODE-${tag}`, base_order_value: 1000, discount: 10, external_customer_id: `cust-${tag}`, external_item_id: `ext-${tag}` } as any));
	await step("REDEMPTIONS.fetchRedemptions [after redeem]", () => qpon.REDEMPTIONS.fetchRedemptions(ORG!));

	await step("COUPONCODE.deactivateCouponCode", () => qpon.COUPONCODE.deactivateCouponCode(ORG!, couponId, campaignId, couponCodeId, {} as any));
	await step("COUPONCODE.reactivateCouponCode", () => qpon.COUPONCODE.reactivateCouponCode(ORG!, couponId, campaignId, couponCodeId, {} as any));
	await step("CAMPAIGN.deactivateCampaign", () => qpon.CAMPAIGN.deactivateCampaign(ORG!, couponId, campaignId));
	await step("CAMPAIGN.reactivateCampaign", () => qpon.CAMPAIGN.reactivateCampaign(ORG!, couponId, campaignId));
	await step("COUPONS.deactivateCoupon", () => qpon.COUPONS.deactivateCoupon(ORG!, couponId));
	await step("COUPONS.reactivateCoupon", () => qpon.COUPONS.reactivateCoupon(ORG!, couponId));

	// Cleanup
	await step("CUSTOMERCOUPONCODE.deleteCustomers", () => qpon.CUSTOMERCOUPONCODE.deleteCustomers(couponId, campaignId, couponCodeId, customerId));
	await step("COUPONCODE.deleteCouponCode", () => qpon.COUPONCODE.deleteCouponCode(ORG!, couponId, campaignId, couponCodeId));
	await step("CAMPAIGN.deleteCampaign", () => qpon.CAMPAIGN.deleteCampaign(ORG!, couponId, campaignId));
	await step("COUPONITEM.removeItem", () => qpon.COUPONITEM.removeItem(ORG!, couponId, itemId));
	await step("COUPONS.deleteCoupon", () => qpon.COUPONS.deleteCoupon(ORG!, couponId));
	await step("ITEM.deleteItem", () => qpon.ITEM.deleteItem(ORG!, itemId));
	await step("CUSTOMERS.deleteCustomer", () => qpon.CUSTOMERS.deleteCustomer(ORG!, customerId));

	const pass = rows.filter((r) => r.ok).length;
	console.log("\n  RESULT  STATUS  OPERATION");
	for (const r of rows) console.log(`  ${r.ok ? "PASS" : "FAIL"}    ${String(r.status ?? "-").padEnd(6)}  ${r.name}${r.note ? `  -> ${r.note}` : ""}`);
	console.log(`\n  ${pass}/${rows.length} passed`);
}

main();
