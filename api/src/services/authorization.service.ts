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
      | typeof OrganizationUser
      | typeof Organization
      | typeof Offer
      | typeof Redemption
      | typeof User
    >
  | 'all';

export type AppAbility = Ability<[actionsType, subjectsType]>;
export const createAppAbility = createAbility as CreateAbility<AppAbility>;

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
  ) {}

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
            ['organization.organizationId'],
          );

          allow(
            'read',
            [CouponSummaryMv, CampaignSummaryMv, OrganizationSummaryMv, Offer],
            {
              organizationId,
            },
          );

          allow(['read', 'update', 'delete'], User, { userId: user.userId });

          allow('manage', CustomerCouponCode, [
            'couponCode.organization.organizationId',
          ]);

          allow('manage', CouponItem, ['coupon.organization.organizationId']);

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
            ['organization.organizationId'],
          );

          allow(
            'read',
            [CouponSummaryMv, CampaignSummaryMv, OrganizationSummaryMv, Offer],
            {
              organizationId,
            },
          );

          allow('read', ApiKey, ['organization.organizationId']);

          allow('manage', CustomerCouponCode, [
            'couponCode.organization.organizationId',
          ]);

          allow('manage', CouponItem, ['coupon.organization.organizationId']);

          allow(['read', 'update', 'delete'], User, { userId: user.userId });

          break;
        case roleEnum.VIEWER:
          allow('read_all', User);

          allow('read_all', OrganizationUser, {
            organizationId: organizationId,
          });

          allow(
            ['read', 'read_all'],
            [Coupon, Campaign, CouponCode, Customer, Item, Redemption, ApiKey],
            ['organization.organizationId'],
          );

          allow(
            'read',
            [CouponSummaryMv, CampaignSummaryMv, OrganizationSummaryMv, Offer],
            {
              organizationId,
            },
          );

          allow('read', CustomerCouponCode, [
            'couponCode.organization.organizationId',
          ]);

          allow('read', CouponItem, ['coupon.organization.organizationId']);

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

  async getSubjectTypes(
    request: any,
    requiredPermissions: { action: actionsType; subject: subjectsType }[],
  ) {
    let subjectObjects: any[] = [];
    this.logger.info(`START: getSubjectTypes service`);

    subjectObjects = await Promise.all(
      requiredPermissions.map(({ action, subject }) => {
        const subjectUserId = request.params.user_id as string;
        const subjectOrganizationId = request.params.organization_id as string;
        const subjectCouponId = request.params.coupon_id as string;
        const subjectCampaignId = request.params.campaign_id as string;
        const subjectCouponCodeId = request.params.coupon_code_id as string;
        const subjectCustomerId = request.params.customer_id as string;
        const subjectItemId = request.params.item_id as string;

        if (subject === User) {
          if (action === 'read' || action === 'create' || action == 'read_all')
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
            return subject;

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
            return subject;

          if (!subjectOrganizationId) {
            throw new BadRequestException(
              `Error. Must provide an Organization ID for performing action on object`,
            );
          }
          return this.organizationService.fetchOrganization(
            subjectOrganizationId,
          );
        } else if (subject === Coupon) {
          if (action === 'read' || action === 'create' || action == 'read_all')
            return subject;

          if (!subjectCouponId) {
            throw new BadRequestException(
              `Error. Must provide an Coupon ID for performing action on Coupon`,
            );
          }
          return this.couponService.fetchCouponForValidation(subjectCouponId);
        } else if (subject === Campaign) {
          if (action === 'read' || action === 'create' || action == 'read_all')
            return subject;

          if (!subjectCampaignId) {
            throw new BadRequestException(
              `Error. Must provide an Campaign ID for performing action on Campaign`,
            );
          }
          return this.campaignService.fetchCampaignForValidation(
            subjectCampaignId,
          );
        } else if (subject === CouponCode) {
          if (action === 'read' || action === 'create' || action == 'read_all')
            return subject;

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
          if (action === 'read' || action === 'create' || action == 'read_all')
            return subject;

          if (!subjectOrganizationId || !subjectCustomerId) {
            throw new BadRequestException(
              `Error. Must provide an Organization ID and Customer ID for performing action on Customer`,
            );
          }
          return this.customerService.fetchCustomer(
            subjectOrganizationId,
            subjectCustomerId,
          );
        } else if (subject === Item) {
          if (action === 'read' || action === 'create' || action == 'read_all')
            return subject;

          if (!subjectItemId) {
            throw new BadRequestException(
              `Error. Must provide an Item ID for performing action on Item`,
            );
          }
          return this.itemService.fetchItemForValidation(subjectItemId);
        } else if (subject === Redemption) {
          return subject;
        } else if (subject === ApiKey) {
          if (action === 'create' || action == 'read') return subject;

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
          subject === Offer
        ) {
          if (action === 'read') return subject;

          if (!subjectOrganizationId) {
            throw new BadRequestException(
              `Error. Must provide an Organization ID for performing action on ${subject.name}`,
            );
          }
        } else if (subject === CustomerCouponCode) {
          if (action === 'read' || action === 'create') return subject;

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
        } else if (subject == CouponItem) {
          if (action === 'read' || action === 'create') return subject;

          if (!subjectCouponId) {
            throw new BadRequestException(
              `Error. Must provide an Coupon ID for performing action on CouponItem`,
            );
          }
          return this.couponItemService.fetchItemForValidation(subjectCouponId);
        } else {
          return subject;
        }
      }),
    );

    this.logger.info(`END: getSubjectTypes service`);
    return subjectObjects;
  }
}
