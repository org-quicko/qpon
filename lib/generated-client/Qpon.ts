import { ApiKeyClient } from "./src/api-key";
import { CampaignClient } from "./src/campaign";
import { CouponClient } from "./src/coupon";
import { CouponCodeClient } from "./src/coupon-code";
import { CouponItemClient } from "./src/coupon-item";
import { CustomerClient } from "./src/customer";
import { CustomerCouponCodeClient } from "./src/customer-coupon-code";
import { ItemClient } from "./src/item";
import { OfferClient } from "./src/offers";
import { OrganizationClient } from "./src/organization";
import { RedemptionClient } from "./src/redemption";
import { UserClient } from "./src/user";
import type { BeforeRequestInterceptor, AfterResponseInterceptor } from "./src/organization/interceptors/types";
import { QponCredentials } from "./QponCredentials";

export class Qpon {
	public ORGANIZATIONS: OrganizationClient;

	public USERS: UserClient;

	public CUSTOMERS: CustomerClient;

	public COUPONS: CouponClient;

	public OFFERS: OfferClient;

	public REDEMPTIONS: RedemptionClient;

	public COUPONITEM: CouponItemClient;

	public CAMPAIGN: CampaignClient;

	public COUPONCODE: CouponCodeClient;

	public CUSTOMERCOUPONCODE: CustomerCouponCodeClient;

	public ITEM: ItemClient;

	public APIKEYS: ApiKeyClient;

	constructor(
		credentials: QponCredentials,
		baseUrl: string,
		requestInterceptors?: BeforeRequestInterceptor[],
		responseInterceptors?: AfterResponseInterceptor[],
	) {
		const options = {
			baseUrl,
			apiKey: credentials.getApiKey(),
			apiSecret: credentials.getApiSecret(),
		};

		this.ORGANIZATIONS = new OrganizationClient(options, requestInterceptors, responseInterceptors);
		this.USERS = new UserClient(options, requestInterceptors, responseInterceptors);
		this.CUSTOMERS = new CustomerClient(options, requestInterceptors, responseInterceptors);
		this.COUPONS = new CouponClient(options, requestInterceptors, responseInterceptors);
		this.OFFERS = new OfferClient(options, requestInterceptors, responseInterceptors);
		this.REDEMPTIONS = new RedemptionClient(options, requestInterceptors, responseInterceptors);
		this.COUPONITEM = new CouponItemClient(options, requestInterceptors, responseInterceptors);
		this.CAMPAIGN = new CampaignClient(options, requestInterceptors, responseInterceptors);
		this.COUPONCODE = new CouponCodeClient(options, requestInterceptors, responseInterceptors);
		this.CUSTOMERCOUPONCODE = new CustomerCouponCodeClient(options, requestInterceptors, responseInterceptors);
		this.ITEM = new ItemClient(options, requestInterceptors, responseInterceptors);
		this.APIKEYS = new ApiKeyClient(options, requestInterceptors, responseInterceptors);
	}
}
