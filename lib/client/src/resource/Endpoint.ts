export class Endpoint {
  static build(
    baseUrl: string,
    endpoint: string,
    args: unknown,
    queryParams?: Record<string, string | number | boolean>
  ) {
    let url = baseUrl.concat(endpoint.toString());
    const regex = '\\{(\\w*)\\}';

    let i = 0;

    let matches: RegExpMatchArray | null;
    const argsArray: Array<unknown> = args instanceof Array ? args : [args];
    do {
      matches = url.match(regex);
      if (matches != null) {
        url = url.replace(
          matches[0],
          args != null &&
            argsArray.length > i &&
            argsArray[i] != null &&
            (argsArray[i] as string).toString() !== ''
            ? (argsArray[i] as string).toString()
            : ''
        );
      }

      i += 1;
    } while (matches != null);

    const constructedUrl = new URL(url);
    // Append query parameters.
    if (queryParams) {
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key] === undefined) return;
        const value = queryParams[key];
        if (Array.isArray(value)) {
          value.forEach((item) => {
            constructedUrl.searchParams.append(key, item);
          });
        } else {
          constructedUrl.searchParams.append(key, value.toString());
        }
      });
    }
    return constructedUrl.toString();
  }
}

export enum APIURL {
  /**
   * Organization Endpoints
   */

  // Fetch Organization
  FETCH_ORGANIZATION = '/organizations/{organization_id}',

  // Fetch Organizations
  FETCH_ORGANIZATIONS = '/organizations',

  // Update Organization
  UPDATE_ORGANIZATION = FETCH_ORGANIZATION,

  // Delete Organization
  DELETE_ORGANIZATION = FETCH_ORGANIZATION,

  /**
   * API Key Endpoints
   */

  // Create API Key
  CREATE_API_KEY = '/organizations/{organization_id}/api-keys',

  // Fetch API Key
  FETCH_API_KEY = CREATE_API_KEY,

  /**
   * User Endpoints
   */

  // Create User
  CREATE_USER = '/organizations/{organization_id}/users',

  // Fetch Users of an Organization
  FETCH_ORGANIZATION_USERS = CREATE_USER,

  // Update User
  UPDATE_USER = '/organizations/{organization_id}/users/{user_id}',

  // Delete User
  DELETE_USER = UPDATE_USER,

  // Update user role in organization
  UPDATE_USER_ROLE = '/organizations/{organization_id}/users/{user_id}/role',

  // Fetch organizations for user
  FETCH_ORGANIZATIONS_FOR_USER = '/users/{user_id}/organizations',

  // Fetch User
  FETCH_USER = '/users/{user_id}',

  // Fetch Users
  FETCH_USERS = '/users',

  /**
   * Coupon Endpoints
   */

  // Create Coupon
  CREATE_COUPON = '/organizations/{organization_id}/coupons',

  // Fetch Coupon
  FETCH_COUPON = '/organizations/{organization_id}/coupons/{coupon_id}',

  // Fetch Coupons
  FETCH_COUPONS = CREATE_COUPON,

  // Update Coupon
  UPDATE_COUPON = FETCH_COUPON,

  // Deactivate Coupon
  DEACTIVATE_COUPON = '/organizations/{organization_id}/coupons/{coupon_id}/deactivate',

  // Reactivate Coupon
  REACTIVATE_COUPON = '/organizations/{organization_id}/coupons/{coupon_id}/reactivate',

  // Delete Coupon
  DELETE_COUPON = FETCH_COUPON,

  // Fetch Coupon Summary
  FETCH_COUPON_SUMMARY = '/organizations/{organization_id}/coupons/summary',

  // Fetch Coupon Summaries
  FETCH_COUPON_SUMMARIES = '/organizations/{organization_id}/coupons/{coupon_id}/summary',

  /**
   * Coupon Item Endpoints
   */

  // Add items to coupon
  ADD_COUPON_ITEMS = '/organizations/{organization_id}/coupons/{coupon_id}/items',

  // Fetch items for coupon
  FETCH_ITEMS_FOR_COUPON = ADD_COUPON_ITEMS,

  // REMOVE items from coupon
  REMOVE_ITEMS_FROM_COUPON = '/organizations/{organization_id}/coupons/{coupon_id}/items/{item_id}',

  // Update items in a coupon
  UPDATE_ITEMS_IN_COUPON = ADD_COUPON_ITEMS,

  /**
   * Campaign Endpoints
   */

  // Create Campaign
  CREATE_CAMPAIGN = '/organizations/{organization_id}/coupons/{coupon_id}/campaigns',

  // Fetch Campaign
  FETCH_CAMPAIGN = '/organizations/{organization_id}/coupons/{coupon_id}/campaigns/{campaign_id}',

  // Fetch Campaigns
  FETCH_CAMPAIGNS = CREATE_CAMPAIGN,

  // Update Campaign
  UPDATE_CAMPAIGN = FETCH_CAMPAIGN,

  // Delete Campaign
  DELETE_CAMPAIGN = UPDATE_CAMPAIGN,

  // Deactivate Campaign
  DEACTIVATE_CAMPAIGN = '/organizations/{organization_id}/coupons/{coupon_id}/campaigns/{campaign_id}/deactivate',

  // Reactivate Campaign
  REACTIVATE_CAMPAIGN = '/organizations/{organization_id}/coupons/{coupon_id}/campaigns/{campaign_id}/reactivate',

  // Fetch Campaign Summary
  FETCH_CAMPAIGN_SUMMARY = '/organizations/{organization_id}/coupons/{coupon_id}/campaigns/{campaign_id}/summary',

  // Fetch Campaign Summaries
  FETCH_CAMPAIGN_SUMMARIES = '/organizations/{organization_id}/coupons/{coupon_id}/campaigns/summary',

  /**
   * Coupon Code Endpoints
   */

  // Create Coupon Code
  CREATE_COUPON_CODE = '/organizations/{organization_id}/coupons/{coupon_id}/campaigns/{campaign_id}/coupon-codes',

  // Fetch Coupon Code
  FETCH_COUPON_CODE = '/organizations/{organization_id}/coupons/{coupon_id}/campaigns/{campaign_id}/coupon-codes/{coupon_code_id}',

  // Fetch Coupon Codes
  FETCH_COUPON_CODES = CREATE_COUPON_CODE,
  // Update Coupon Code
  UPDATE_COUPON_CODE = FETCH_COUPON_CODE,

  // Fetch Coupon Codes by Coupon
  FETCH_COUPON_CODES_BY_COUPON = '/organizations/{organization_id}/coupons/{coupon_id}/coupon-codes',

  // Delete Coupon Code
  DELETE_COUPON_CODE = FETCH_COUPON_CODE,

  // Deactivate Coupon Code
  DEACTIVATE_COUPON_CODE = '/organizations/{organization_id}/coupons/{coupon_id}/campaigns/{campaign_id}/coupon-codes/{coupon_code_id}/deactivate',

  // Reactivate Coupon Code
  REACTIVATE_COUPON_CODE = '/organizations/{organization_id}/coupons/{coupon_id}/campaigns/{campaign_id}/coupon-codes/{coupon_code_id}/reactivate',

  /**
   * Customer Coupon Code Endpoints
   */
  // Add customers to coupon code
  ADD_CUSTOMERS_TO_COUPON_CODE = '/coupons/{coupon_id}/campaigns/{campaign_id}/coupon-codes/{coupon_code_id}/customers',

  // Fetch customers for coupon code
  FETCH_CUSTOMERS_FOR_COUPON_CODE = ADD_CUSTOMERS_TO_COUPON_CODE,

  // Update customers associated with coupon code
  UPDATE_CUSTOMER_COUPON_CODE = ADD_CUSTOMERS_TO_COUPON_CODE,

  // Delete customers from coupon code
  DELETE_CUSTOMER_COUPON_CODE = '/coupons/{coupon_id}/campaigns/{campaign_id}/coupon-codes/{coupon_code_id}/customers/{customer_id}',

  /**
   * Customer Endpoints
   */

  // Create Customer
  CREATE_CUSTOMER = '/organizations/{organization_id}/customers',

  // Fetch Customer
  FETCH_CUSTOMER = '/organizations/{organization_id}/customers/{customer_id}',

  // Fetch Customers
  FETCH_CUSTOMERS = CREATE_CUSTOMER,

  // Update Customer
  UPDATE_CUSTOMER = FETCH_CUSTOMER,

  // Delete Customer
  DELETE_CUSTOMER = UPDATE_CUSTOMER,

  // Upsert Customer
  UPSERT_CUSTOMER = '/organizations/{organization_id}/customers/upsert',

  /**
   * Item Endpoints
   */

  // Create Item
  CREATE_ITEM = '/organizations/{organization_id}/items',

  // Fetch Item
  FETCH_ITEM = '/organizations/{organization_id}/items/{item_id}',

  // Fetch Items
  FETCH_ITEMS = CREATE_ITEM,

  // Update Item
  UPDATE_ITEM = FETCH_ITEM,

  // Delete Item
  DELETE_ITEM = UPDATE_ITEM,

  // Upsert Item
  UPSERT_ITEM = '/organizations/{organization_id}/items/upsert',

  /**
   * Offer Endpoints
   */

  // Fetch Offer
  FETCH_OFFER = '/organizations/{organization_id}/offer',

  // Fetch Offers
  FETCH_OFFERS = '/organizations/{organization_id}/offers',

  /**
   * Redemption Endpoints
   */

  // Redeem Coupon Code
  REDEEM_COUPON_CODE = '/organizations/{organization_id}/coupon-codes/redeem',

  // Fetch Redemptions
  FETCH_REDEMPTIONS = '/organizations/{organization_id}/redemptions',

  // Fetch Redemptions for Coupon Code
  FETCH_REDEMPTIONS_FOR_COUPON_CODE = '/organizations/{organization_id}/coupons/{coupon_id}/campaigns/{campaign_id}/coupon-codes/{coupon_code_id}/redemptions',

  // Generate Redemption Report
  GENERATE_REDEMPTION_REPORT = '/organizations/{organization_id}/redemptions/reports',
}
