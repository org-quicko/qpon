import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "index",
      label: "Introduction",
    },
    {
      type: "category",
      label: "Organization",
      items: [
        {
          type: "doc",
          id: "create-organization",
          label: "Create organization",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fetch-organizations",
          label: "Fetch organizations",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "fetch-organization",
          label: "Fetch organization",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "update-organization",
          label: "Update organization",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "delete-organization",
          label: "Delete organization",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "Coupon",
      items: [
        {
          type: "doc",
          id: "create-coupon",
          label: "Create coupon",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fetch-coupons",
          label: "Fetch coupons",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "fetch-coupon",
          label: "Fetch coupon",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "update-coupon",
          label: "Update coupon",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "delete-coupon",
          label: "Delete coupon",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "deactivate-coupon",
          label: "Deactivate coupon",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "reactivate-coupon",
          label: "Reactivate coupon",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fetch-coupons-summary",
          label: "Fetch coupons summary",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "fetch-coupon-summary",
          label: "Fetch coupon summary",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Campaign",
      items: [
        {
          type: "doc",
          id: "create-campaign",
          label: "Create campaign",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fetch-campaign",
          label: "Fetch campaign",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "update-campaign",
          label: "Update campaign",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "delete-campaign",
          label: "Delete campaign",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "fetch-campaigns",
          label: "Fetch campaigns",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "deactivate-campaign",
          label: "Deactivate campaign",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "reactivate-campaign",
          label: "Reactivate campaign",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fetch-campaigns-summary",
          label: "Fetch campaigns summary",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "fetch-campaign-summary",
          label: "Fetch campaign summary",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Coupon Code",
      items: [
        {
          type: "doc",
          id: "create-coupon-code",
          label: "Create coupon code",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fetch-coupon-codes",
          label: "Fetch coupon codes",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "fetch-coupon-code",
          label: "Fetch coupon code",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "update-coupon-code",
          label: "Update coupon code",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "fetch-coupon-code-by-code",
          label: "Fetch coupon code by code",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "deactivate-coupon-code",
          label: "Deactivate coupon code",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "reactivate-coupon-code",
          label: "Reactivate coupon code",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "delete-coupon-code",
          label: "Delete coupon code",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "Offers",
      items: [
        {
          type: "doc",
          id: "fetch-offer",
          label: "Fetch offer",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "fetch-offers",
          label: "Fetch offers",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "User",
      items: [
        {
          type: "doc",
          id: "create-super-admin",
          label: "Create super admin",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fetch-users",
          label: "Fetch users",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "create-user",
          label: "Create user",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fetch-users-of-an-organization",
          label: "Fetch users of an organization",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "update-user",
          label: "Update user",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "delete-user",
          label: "Delete user",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "login",
          label: "Login",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "update-user-role-in-organization",
          label: "Update user role in organization",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "fetch-organizations-for-a-user",
          label: "Fetch organizations for a User",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "fetch-user",
          label: "Fetch user",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Api Key",
      items: [
        {
          type: "doc",
          id: "create-api-key",
          label: "Create Api Key",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fetch-api-key",
          label: "Fetch Api key",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Coupon Item",
      items: [
        {
          type: "doc",
          id: "add-items",
          label: "Add items",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fetch-items",
          label: "Fetch items",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "update-items",
          label: "Update items",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "remove-item",
          label: "Remove item",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "Item",
      items: [
        {
          type: "doc",
          id: "create-item",
          label: "Create item",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fetch-items",
          label: "Fetch items",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "update-item",
          label: "Update item",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "delete-item",
          label: "Delete item",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "fetch-item",
          label: "Fetch item",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "upsert-item",
          label: "Upsert item",
          className: "api-method put",
        },
      ],
    },
    {
      type: "category",
      label: "Customer",
      items: [
        {
          type: "doc",
          id: "create-customer",
          label: "Create customer",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fetch-customers",
          label: "Fetch customers",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "update-customer",
          label: "Update customer",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "delete-customer",
          label: "Delete customer",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "fetch-customer",
          label: "Fetch customer",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "upsert-customer",
          label: "Upsert Customer",
          className: "api-method put",
        },
      ],
    },
    {
      type: "category",
      label: "Customer coupon code",
      items: [
        {
          type: "doc",
          id: "add-customers",
          label: "Add customers",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fetch-customers",
          label: "Fetch customers",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "update-customers",
          label: "Update customers",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "delete-customers",
          label: "Delete customers",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "Redemption",
      items: [
        {
          type: "doc",
          id: "redeem-coupon-code",
          label: "Redeem coupon code",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "fetch-redemptions",
          label: "Fetch redemptions",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "fetch-redemptions-for-coupon-code",
          label: "Fetch redemptions for coupon code",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "generate-redemption-report",
          label: "Generate Redemption Report",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
