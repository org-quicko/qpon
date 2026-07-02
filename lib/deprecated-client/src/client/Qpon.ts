import { QponCredentials } from '../beans';
import { Campaign, Coupon, CouponCode, CouponItem, Customer, CustomerCouponCode, Item, Offer, Organization, Redemption, User } from './methods';

export class Qpon {
  public COUPONS: Coupon;

  public ORGANIZATIONS: Organization;

  public REDEMPTIONS: Redemption;

  public OFFERS: Offer;

  public USERS: User;

  public CUSTOMERS: Customer;

  public COUPONITEM: CouponItem;

  public CAMPAIGN: Campaign;

  public COUPONCODE: CouponCode;

  public CUSTOMERCOUPONCODE: CustomerCouponCode;

  public ITEM: Item;

  constructor(config: QponCredentials, baseUrl: string) {
    this.ORGANIZATIONS = new Organization(config, baseUrl);
    this.USERS = new User(config, baseUrl);
    this.CUSTOMERS = new Customer(config, baseUrl);
    this.COUPONS = new Coupon(config, baseUrl);
    this.OFFERS = new Offer(config, baseUrl);
    this.REDEMPTIONS = new Redemption(config, baseUrl);
    this.COUPONITEM = new CouponItem(config, baseUrl);
    this.CAMPAIGN = new Campaign(config, baseUrl);
    this.COUPONCODE = new CouponCode(config, baseUrl);
    this.CUSTOMERCOUPONCODE = new CustomerCouponCode(config, baseUrl);
    this.ITEM = new Item(config, baseUrl);
  }
}
