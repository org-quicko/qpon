import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  apiSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'Introduction',
    },
    {
      type: 'category',
      label: 'Organization',
      items: [
        { type: 'doc', id: 'create-organization', label: 'Create organization', className: 'api-method post' },
        { type: 'doc', id: 'fetch-organizations', label: 'Fetch organizations', className: 'api-method get' },
        { type: 'doc', id: 'fetch-organization', label: 'Fetch organization', className: 'api-method get' },
        { type: 'doc', id: 'update-organization', label: 'Update organization', className: 'api-method put' },
        { type: 'doc', id: 'delete-organization', label: 'Delete organization', className: 'api-method delete' },
        { type: 'doc', id: 'fetch-organization-summary', label: 'Fetch organization summary', className: 'api-method get' },
      ],
    },
    {
      type: 'category',
      label: 'Coupon',
      items: [
        { type: 'doc', id: 'create-coupon', label: 'Create coupon', className: 'api-method post' },
        { type: 'doc', id: 'fetch-coupons', label: 'Fetch coupons', className: 'api-method get' },
        { type: 'doc', id: 'fetch-coupon', label: 'Fetch coupon', className: 'api-method get' },
        { type: 'doc', id: 'update-coupon', label: 'Update coupon', className: 'api-method put' },
        { type: 'doc', id: 'delete-coupon', label: 'Delete coupon', className: 'api-method delete' },
        { type: 'doc', id: 'deactivate-coupon', label: 'Deactivate coupon', className: 'api-method patch' },
        { type: 'doc', id: 'reactivate-coupon', label: 'Reactivate coupon', className: 'api-method patch' },
        { type: 'doc', id: 'fetch-coupons-summary', label: 'Fetch coupons summary', className: 'api-method get' },
      ],
    },
    {
      type: 'category',
      label: 'Campaign',
      items: [
        { type: 'doc', id: 'create-campaign', label: 'Create campaign', className: 'api-method post' },
        { type: 'doc', id: 'fetch-campaigns', label: 'Fetch campaigns', className: 'api-method get' },
        { type: 'doc', id: 'fetch-campaign', label: 'Fetch campaign', className: 'api-method get' },
        { type: 'doc', id: 'update-campaign', label: 'Update campaign', className: 'api-method put' },
        { type: 'doc', id: 'delete-campaign', label: 'Delete campaign', className: 'api-method delete' },
        { type: 'doc', id: 'deactivate-campaign', label: 'Deactivate campaign', className: 'api-method patch' },
        { type: 'doc', id: 'reactivate-campaign', label: 'Reactivate campaign', className: 'api-method patch' },
        { type: 'doc', id: 'fetch-campaign-summary', label: 'Fetch campaign summary', className: 'api-method get' },
      ],
    },
    {
      type: 'category',
      label: 'Coupon Code',
      items: [
        { type: 'doc', id: 'create-coupon-code', label: 'Create coupon code', className: 'api-method post' },
        { type: 'doc', id: 'fetch-coupon-codes', label: 'Fetch coupon codes', className: 'api-method get' },
        { type: 'doc', id: 'fetch-coupon-code', label: 'Fetch coupon code', className: 'api-method get' },
        { type: 'doc', id: 'update-coupon-code', label: 'Update coupon code', className: 'api-method put' },
        { type: 'doc', id: 'fetch-coupon-codes-by-code', label: 'Fetch coupon codes by code', className: 'api-method get' },
        { type: 'doc', id: 'deactivate-coupon-code', label: 'Deactivate coupon code', className: 'api-method patch' },
        { type: 'doc', id: 'reactivate-coupon-code', label: 'Reactivate coupon code', className: 'api-method patch' },
      ],
    },
    {
      type: 'category',
      label: 'Offer',
      items: [
        { type: 'doc', id: 'fetch-offers', label: 'Fetch offers', className: 'api-method get' },
        { type: 'doc', id: 'fetch-offer', label: 'Fetch offer', className: 'api-method get' },
      ],
    },
    {
      type: 'category',
      label: 'Redemption',
      items: [
        { type: 'doc', id: 'redeem-coupon-code', label: 'Redeem coupon code', className: 'api-method post' },
        { type: 'doc', id: 'fetch-redemptions', label: 'Fetch redemptions', className: 'api-method get' },
      ],
    },
    {
      type: 'category',
      label: 'Item',
      items: [
        { type: 'doc', id: 'create-item', label: 'Create item', className: 'api-method post' },
        { type: 'doc', id: 'fetch-items', label: 'Fetch items', className: 'api-method get' },
        { type: 'doc', id: 'update-item', label: 'Update item', className: 'api-method put' },
        { type: 'doc', id: 'delete-item', label: 'Delete item', className: 'api-method delete' },
        { type: 'doc', id: 'fetch-item', label: 'Fetch item', className: 'api-method get' },
      ],
    },
    {
      type: 'category',
      label: 'Customer',
      items: [
        { type: 'doc', id: 'create-customer', label: 'Create customer', className: 'api-method post' },
        { type: 'doc', id: 'fetch-customers', label: 'Fetch customers', className: 'api-method get' },
        { type: 'doc', id: 'update-customer', label: 'Update customer', className: 'api-method put' },
        { type: 'doc', id: 'delete-customer', label: 'Delete customer', className: 'api-method delete' },
      ],
    },
    {
      type: 'category',
      label: 'User',
      items: [
        { type: 'doc', id: 'create-user', label: 'Create user', className: 'api-method post' },
        { type: 'doc', id: 'fetch-users', label: 'Fetch users', className: 'api-method get' },
        { type: 'doc', id: 'update-user', label: 'Update user', className: 'api-method put' },
        { type: 'doc', id: 'delete-user', label: 'Delete user', className: 'api-method delete' },
      ],
    },
  ],
};

export default sidebars;
