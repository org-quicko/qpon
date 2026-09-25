import {
  InferSubjects,
  createMongoAbility as createAbility,
  MongoAbility as Ability,
  CreateAbility,
  AbilityBuilder,
  ExtractSubjectType,
} from '@casl/ability';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ApiKey } from 'src/entities/api-key.entity';
import { CampaignSummaryMv } from 'src/entities/campaign-summary.view';
import { Campaign } from 'src/entities/campaign.entity';
import { CouponCode } from 'src/entities/coupon-code.entity';
import { CouponItem } from 'src/entities/coupon-item.entity';
import { CouponSummaryMv } from 'src/entities/coupon-summary.view';
import { Coupon } from 'src/entities/coupon.entity';
import { CustomerCouponCode } from 'src/entities/customer-coupon-code.entity';
import { Customer } from 'src/entities/customer.entity';
import { Item } from 'src/entities/item.entity';
import { Offer } from 'src/entities/offer.view';
import { OrganizationSummaryMv } from 'src/entities/organization-summary.view';
import { OrganizationUser } from 'src/entities/organization-user.entity';
import { Organization } from 'src/entities/organization.entity';
import { Redemption } from 'src/entities/redemption.entity';
import { User } from 'src/entities/user.entity';
import { roleEnum } from 'src/enums';
import { LoggerService } from './logger.service';
import { UserService } from './user.service';
import { OrganizationService } from './organization.service';
import { ItemsService } from './item.service';
import { CustomersService } from './customer.service';
import { CouponCodeService } from './coupon-code.service';
import { CampaignService } from './campaign.service';
import { CouponService } from './coupon.service';
import { ApiKeyService } from './api-key.service';
import { CustomerCouponCodeService } from './customer-coupon-code.service';
import { CouponItemService } from './coupon-item.service';
import { ItemWiseDayWiseRedemptionSummaryMv } from 'src/entities/item-wise-day-wise-redemption-summary-mv';
import { CouponCodesWiseDayWiseRedemptionSummaryMv } from 'src/entities/coupon-codes-wise-day-wise-redemption-summary-mv';
import { DayWiseRedemptionSummaryMv } from 'src/entities/day-wise-redemption-summary-mv';
import { CustomerWiseDayWiseRedemptionSummaryMv } from 'src/entities/customer_wise_day_wise_redemption_summary_mv';

export const actions = [
  'manage',
  'create',
  'read',
  'read_all',
  'update',
  'delete',
  'change_role',
  'invite_user',
  'remove_user',
] as const;

export type actionsType = (typeof actions)[number];

export type subjectsType =
  | InferSubjects<
    | typeof ApiKey
    | typeof CampaignSummaryMv
    | typeof Campaign
    | typeof CouponCode
    | typeof CouponItem
    | typeof CouponSummaryMv
    | typeof Coupon
    | typeof CustomerCouponCode
    | typeof Customer
    | typeof Item
    | typeof OrganizationSummaryMv
    | typeof ItemWiseDayWiseRedemptionSummaryMv
    | typeof CustomerWiseDayWiseRedemptionSummaryMv
    | typeof CouponCodesWiseDayWiseRedemptionSummaryMv
    | typeof DayWiseRedemptionSummaryMv
    | typeof OrganizationUser
    | typeof Organization
    | typeof Offer
    | typeof Redemption
    | typeof User
  >
  | 'all';

export type AppAbility = Ability<[actionsType, subjectsType]>;
export const createAppAbility = createAbility as CreateAbility<AppAbility>;

/**
 * Builds the CASL conditions object that scopes a rule to one organization.
 *
 * `path` is the dot-separated route from the subject to its organization id
 * (e.g. 'organization.organizationId' on a Coupon,
 * 'coupon.organization.organizationId' on a CouponItem). CASL resolves dot
 * paths at runtime, but its `MongoQuery<T>` type only admits a subject's own
 * keys, so the object is widened here rather than cast at each call site.
 *
 * Passing this scope as an ARRAY is the mistake this helper exists to
 * prevent: CASL reads a third positional array as `fields`, which imposes no
 * organization restriction at all, so every member of every organization
 * passes the check.
 */
function inOrganization(path: string, organizationId: string): any {
  return { [path]: organizationId };
}

/** Where a subject carries its organization id, matching the rules above. */
type organizationScopePath =
  | 'organizationId'
  | 'organization.organizationId'
  | 'coupon.organization.organizationId'
  | 'couponCode.organization.organizationId';

/**
 * Builds a subject INSTANCE carrying an organization id, for the actions that
 * have no single entity to authorize against — `create` (nothing exists yet)
 * and `read_all` (a collection, not a row).
 *
 * Returning the bare subject CLASS for those actions, as this file used to,
 * means CASL matches on subject type alone: a rule's `conditions` are only
 * evaluated against an instance, so the organization scope was skipped
 * entirely and any member of any organization was allowed through.
 *
 * `Object.create(subject.prototype)` is deliberate — the instance must have
 * the right constructor for `detectSubjectType`, but running the real
 * constructor is unnecessary and would invoke entity decorators.
 *
 * Falls back to the class when the route carries no `organization_id`. Those
 * routes have no organization to check against (e.g.
 * `GET /users/:user_id/organizations`, or `POST /organizations` itself), and
 * only rules with no organization condition can match them anyway.
 */
function subjectInOrganization(
  subject: any,
  organizationId: string | undefined,
  path: organizationScopePath,
): any {
  if (!organizationId) {
    return subject;
  }

  const instance = Object.create(subject.prototype);

  switch (path) {
    case 'organizationId':
      instance.organizationId = organizationId;
      break;
    case 'organization.organizationId':
      instance.organization = { organizationId };
      break;
    case 'coupon.organization.organizationId':
      instance.coupon = { organization: { organizationId } };
      break;
    case 'couponCode.organization.organizationId':
      instance.couponCode = { organization: { organizationId } };
      break;
  }

  return instance;
}

@Injectable()
export class AuthorizationService {
  constructor(
    private logger: LoggerService,
    private userService: UserService,
    private organizationService: OrganizationService,
    private couponService: CouponService,
    private campaignService: CampaignService,
    private couponCodeService: CouponCodeService,
    private customerCouponCodeService: CustomerCouponCodeService,
    private couponItemService: CouponItemService,
    private customerService: CustomersService,
    private itemService: ItemsService,
    private apiKeyService: ApiKeyService,
  ) { }

  getOrganizationUserPermissions(user: User) {
    const organizationUserPermissions = {};

    user.organizationUser.forEach((organizationUser) => {
      organizationUserPermissions[organizationUser.organizationId] =
        organizationUser.role;
    });

    return organizationUserPermissions;
  }

  getUserAbility(user: User) {
    const userPermissions = this.getOrganizationUserPermissions(user);

    const { can: allow, build } = new AbilityBuilder<AppAbility>(createAbility);

    if (user.role == roleEnum.SUPER_ADMIN) {
      allow('manage', 'all');
    }

    for (const [organizationId, role] of Object.entries(userPermissions)) {
      switch (role) {
        case roleEnum.SUPER_ADMIN:
          allow('manage', 'all');
          break;
        case roleEnum.ADMIN:
          allow('read', Organization, {
            organizationId: organizationId,
          });

          allow(['invite_user', 'read_all', 'read', 'remove_user'], User);

          allow(['change_role', 'read_all'], OrganizationUser, {
            organizationId: organizationId,
          });

          allow(
            'manage',
            [Coupon, Campaign, CouponCode, Customer, Item, Redemption, ApiKey],
            inOrganization('organization.organizationId', organizationId),
          );

          allow(
            'read',
            [CouponSummaryMv, CampaignSummaryMv, OrganizationSummaryMv, Offer, ItemWiseDayWiseRedemptionSummaryMv, CouponCodesWiseDayWiseRedemptionSummaryMv, DayWiseRedemptionSummaryMv, CustomerWiseDayWiseRedemptionSummaryMv],
            {
              organizationId,
            },
          );

          allow(['read', 'update', 'delete'], User, { userId: user.userId });

          allow(
            'manage',
            CustomerCouponCode,
            inOrganization(
              'couponCode.organization.organizationId',
              organizationId,
            ),
          );

          allow(
            'manage',
            CouponItem,
            inOrganization('coupon.organization.organizationId', organizationId),
          );

          break;
        case roleEnum.EDITOR:
          allow('read', Organization, {
            organizationId,
          });

          allow('read_all', OrganizationUser, {
            organizationId: organizationId,
          });

          allow('read_all', User);

          allow(
            'manage',
            [Coupon, Campaign, CouponCode, Customer, Item, Redemption],
            inOrganization('organization.organizationId', organizationId),
          );

          allow(
            'read',
            [CouponSummaryMv, CampaignSummaryMv, OrganizationSummaryMv, Offer, ItemWiseDayWiseRedemptionSummaryMv, CouponCodesWiseDayWiseRedemptionSummaryMv, DayWiseRedemptionSummaryMv, CustomerWiseDayWiseRedemptionSummaryMv],
            {
              organizationId,
            },
          );

          allow(
            'read',
            ApiKey,
            inOrganization('organization.organizationId', organizationId),
          );

          allow(
            'manage',
            CustomerCouponCode,
            inOrganization(
              'couponCode.organization.organizationId',
              organizationId,
            ),
          );

          allow(
            'manage',
            CouponItem,
            inOrganization('coupon.organization.organizationId', organizationId),
          );

          allow(['read', 'update', 'delete'], User, { userId: user.userId });

          break;
        case roleEnum.VIEWER:
          allow('read_all', User);

          allow('read_all', OrganizationUser, {
            organizationId: organizationId,
          });

          allow('read', Organization, {
            organizationId,
          });

          allow(
            ['read', 'read_all'],
            [Coupon, Campaign, CouponCode, Customer, Item, Redemption, ApiKey],
            inOrganization('organization.organizationId', organizationId),
          );

          allow(
            'read',
            [CouponSummaryMv, CampaignSummaryMv, OrganizationSummaryMv, Offer, ItemWiseDayWiseRedemptionSummaryMv, CouponCodesWiseDayWiseRedemptionSummaryMv, DayWiseRedemptionSummaryMv, CustomerWiseDayWiseRedemptionSummaryMv],
            {
              organizationId,
            },
          );

          allow(
            'read',
            CustomerCouponCode,
            inOrganization(
              'couponCode.organization.organizationId',
              organizationId,
            ),
          );

          allow(
            'read',
            CouponItem,
            inOrganization('coupon.organization.organizationId', organizationId),
          );

          allow(['read', 'update', 'delete'], User, { userId: user.userId });
          break;
        default:
          break;
      }
    }

    const ability = build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<subjectsType>,
    });

    return ability;
  }

  getApiUserAbility(organizationId: string): AppAbility {
    const { can: allow, build } = new AbilityBuilder<AppAbility>(createAbility);

    allow('read', Organization, {
      organizationId: organizationId,
    });

    allow(['invite_user', 'read_all', 'read', 'remove_user'], User);

    allow(['change_role', 'read_all'], OrganizationUser, {
      organizationId: organizationId,
    });

    allow(
      'manage',
      [Coupon, Campaign, CouponCode, Customer, Item, Redemption, ApiKey],
      inOrganization('organization.organizationId', organizationId),
    );

    allow(
      'read',
      [CouponSummaryMv, CampaignSummaryMv, OrganizationSummaryMv, Offer, ItemWiseDayWiseRedemptionSummaryMv, CouponCodesWiseDayWiseRedemptionSummaryMv, DayWiseRedemptionSummaryMv, CustomerWiseDayWiseRedemptionSummaryMv],
      {
        organizationId,
      },
    );

    allow(['read', 'update', 'delete'], User);

    allow(
      'manage',
      CustomerCouponCode,
      inOrganization('couponCode.organization.organizationId', organizationId),
    );

    allow(
      'manage',
      CouponItem,
      inOrganization('coupon.organization.organizationId', organizationId),
    );

    const ability = build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<subjectsType>,
    });

    return ability;
  }

  async getSubjectTypes(
    request: any,
    requiredPermissions: { action: actionsType; subject: subjectsType }[],
  ) {
    let subjectObjects: any[] = [];
    this.logger.info(`START: getSubjectTypes service`);

    subjectObjects = await Promise.all(
      requiredPermissions.map(async ({ action, subject }) => {
        const subjectUserId = request.params.user_id as string;
        const subjectOrganizationId = request.params.organization_id as string;
        const subjectCouponId = request.params.coupon_id as string;
        const subjectCampaignId = request.params.campaign_id as string;
        const subjectCouponCodeId = request.params.coupon_code_id as string;
        const subjectCustomerId = request.params.customer_id as string;
        const subjectItemId = request.params.item_id as string;

        if (subject === User) {
          if (
            action === 'read' ||
            action === 'create' ||
            action == 'read_all' ||
            action === 'invite_user'
          )
            return subject;

          if (!subjectUserId) {
            throw new BadRequestException(
              `Error. Must provide a User ID for performing action on object`,
            );
          }
          return this.userService.fetchUserForValidation({
            userId: subjectUserId,
          });
        } else if (subject === OrganizationUser) {
          if (action === 'read_all' || action === 'create' || action == 'read')
            return subjectInOrganization(
              subject,
              subjectOrganizationId,
              'organizationId',
            );

          if (!subjectOrganizationId || !subjectUserId) {
            throw new BadRequestException(
              `Error. Must provide Organization ID and User ID for performing action on object`,
            );
          }
          return this.userService.fetchUserForValidation({
            userId: subjectUserId,
            organizationUser: {
              organization: {
                organizationId: subjectOrganizationId,
              },
            },
          });
        } else if (subject === Organization) {
          if (action === 'read' || action == 'read_all' || action === 'create')
            return subjectInOrganization(
              subject,
              subjectOrganizationId,
              'organizationId',
            );

          if (!subjectOrganizationId) {
            throw new BadRequestException(
              `Error. Must provide an Organization ID for performing action on object`,
            );
          }
          return this.organizationService.fetchOrganization(
            subjectOrganizationId,
          );
        } else if (subject === Coupon) {
          // `read` names a single coupon, so authorize against that coupon
          // rather than the organization in the path — otherwise org A's
          // member can read org B's coupon by putting A's id in the path.
          if (action === 'create' || action == 'read_all' || !subjectCouponId) {
            return subjectInOrganization(
              subject,
              subjectOrganizationId,
              'organization.organizationId',
            );
          }

          if (!subjectCouponId) {
            throw new BadRequestException(
              `Error. Must provide an Coupon ID for performing action on Coupon`,
            );
          }
          return this.couponService.fetchCouponForValidation(subjectCouponId);
        } else if (subject === Campaign) {
          if (
            action === 'create' ||
            action == 'read_all' ||
            !subjectCampaignId
          ) {
            return subjectInOrganization(
              subject,
              subjectOrganizationId,
              'organization.organizationId',
            );
          }

          if (!subjectCampaignId) {
            throw new BadRequestException(
              `Error. Must provide an Campaign ID for performing action on Campaign`,
            );
          }
          return this.campaignService.fetchCampaignForValidation(
            subjectCampaignId,
          );
        } else if (subject === CouponCode) {
          // GET /organizations/:organization_id/coupon-codes looks a code up
          // by value and carries no coupon/campaign/code id, so it can only
          // be scoped to the organization in the path.
          if (
            action === 'create' ||
            action == 'read_all' ||
            !subjectCouponCodeId ||
            !subjectCouponId ||
            !subjectCampaignId
          ) {
            return subjectInOrganization(
              subject,
              subjectOrganizationId,
              'organization.organizationId',
            );
          }

          if (
            !subjectCouponCodeId ||
            !subjectOrganizationId ||
            !subjectCouponId ||
            !subjectCampaignId
          ) {
            throw new BadRequestException(
              `Error. Must provide an Organization ID, Coupon ID, Campaign ID and Coupon code ID for performing action on CouponCode`,
            );
          }
          return this.couponCodeService.fetchCouponCodeForValidation(
            subjectOrganizationId,
            subjectCouponId,
            subjectCampaignId,
            subjectCouponCodeId,
          );
        } else if (subject === Customer) {
          if (action === 'create' || !subjectCustomerId) {
            return subjectInOrganization(
              subject,
              subjectOrganizationId,
              'organization.organizationId',
            );
          }

          if (!subjectOrganizationId || !subjectCustomerId) {
            throw new BadRequestException(
              `Error. Must provide an Organization ID and Customer ID for performing action on Customer`,
            );
          }
          return this.customerService.fetchCustomerForValidation(
            subjectOrganizationId,
            subjectCustomerId,
          );
        } else if (subject === Item) {
          if (action === 'create' || action == 'read_all' || !subjectItemId) {
            return subjectInOrganization(
              subject,
              subjectOrganizationId,
              'organization.organizationId',
            );
          }

          if (!subjectItemId) {
            throw new BadRequestException(
              `Error. Must provide an Item ID for performing action on Item`,
            );
          }
          return this.itemService.fetchItemForValidation(subjectItemId);
        } else if (subject === Redemption) {
          // Redemptions are only ever listed or reported on, never addressed
          // individually by the guard, so the path organization is the scope.
          return subjectInOrganization(
            subject,
            subjectOrganizationId,
            'organization.organizationId',
          );
        } else if (subject === ApiKey) {
          // An organization may legitimately have no key yet, and
          // fetchApiKey returns null in that case — which CASL cannot type,
          // so scope these to the path organization instead.
          if (action === 'create' || action == 'read')
            return subjectInOrganization(
              subject,
              subjectOrganizationId,
              'organization.organizationId',
            );

          if (!subjectOrganizationId) {
            throw new BadRequestException(
              `Error. Must provide an Organization ID for performing action on ApiKey`,
            );
          }
          return this.apiKeyService.fetchApiKey(subjectOrganizationId);
        } else if (
          subject === CouponSummaryMv ||
          subject === CampaignSummaryMv ||
          subject === OrganizationSummaryMv ||
          subject === Offer ||
          // These four used to fall through to the bare-class `else` below,
          // so the reporting endpoints were readable across organizations.
          subject === ItemWiseDayWiseRedemptionSummaryMv ||
          subject === CouponCodesWiseDayWiseRedemptionSummaryMv ||
          subject === DayWiseRedemptionSummaryMv ||
          subject === CustomerWiseDayWiseRedemptionSummaryMv
        ) {
          // Every route reaching these carries :organization_id, and the
          // rules are scoped by a flat `organizationId` column on the view.
          if (!subjectOrganizationId) {
            throw new BadRequestException(
              `Error. Must provide an Organization ID for performing action on ${subject.name}`,
            );
          }

          return subjectInOrganization(
            subject,
            subjectOrganizationId,
            'organizationId',
          );
        } else if (subject === CouponItem) {
          // CouponItem had no branch at all, so every action on it — create,
          // read, update and delete — reached the bare-class `else` and was
          // permitted in any organization. Its rules are scoped by
          // `coupon.organization.organizationId`, so authorize against the
          // real coupon: trusting :organization_id from the path would let a
          // member of org A pair A's id with a coupon belonging to org B.
          if (!subjectCouponId) {
            throw new BadRequestException(
              `Error. Must provide a Coupon ID for performing action on CouponItem`,
            );
          }

          const coupon = await this.couponService.fetchCouponForValidation(
            subjectCouponId,
          );

          const couponItem = Object.create(CouponItem.prototype);
          couponItem.coupon = coupon;
          return couponItem;
        } else if (subject === CustomerCouponCode) {
          // This controller is mounted without :organization_id, so the
          // organization is reached through the coupon code. The service
          // returns a subject carrying it even when the allow-list is empty.
          if (!subjectCouponCodeId || !subjectCouponId || !subjectCampaignId) {
            throw new BadRequestException(
              `Error. Must provide an Coupon Code ID, Coupon Code ID and Campaign ID for performing action on CustomerCouponCode`,
            );
          }
          return this.customerCouponCodeService.fetchCustomerForValidation(
            subjectCouponId,
            subjectCampaignId,
            subjectCouponCodeId,
          );
        } else {
          return subject;
        }
      }),
    );

    this.logger.info(`END: getSubjectTypes service`);
    return subjectObjects;
  }
}
