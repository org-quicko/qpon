import 'reflect-metadata';
import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { OrganizationUserDto } from '../../dtos/organization-user.dto';
import {
  CreateOrganizationDto,
  OrganizationDto,
} from '../../dtos/organization.dto';
import {
  CreateCustomerDto,
  CustomerDto,
  UpdateCustomerDto,
} from '../../dtos/customer.dto';
import { CreateItemDto, ItemDto, UpdateItemDto } from '../../dtos/item.dto';
import {
  CouponDto,
  CreateCouponDto,
  UpdateCouponDto,
} from '../../dtos/coupon.dto';
import {
  CouponItemDto,
  CreateCouponItemDto,
  UpdateCouponItemDto,
} from '../../dtos/coupon-item.dto';
import { CampaignSummaryRow } from '@org-quicko/qpon-sheet-core/campaign_summary_workbook/beans';
import {
  CampaignDto,
  CreateCampaignDto,
  UpdateCampaignDto,
} from '../../dtos/campaign.dto';
import { CouponSummaryRow } from '@org-quicko/qpon-sheet-core/coupon_summary_workbook/beans';
import {
  CouponCodeDto,
  CreateCouponCodeDto,
  UpdateCouponCodeDto,
} from '../../dtos/coupon-code.dto';
import {
  CreateCustomerCouponCodeDto,
  CustomerCouponCodeDto,
  UpdateCustomerCouponCodeDto,
} from '../../dtos/customer-coupon-code.dto';
import { RedemptionRow } from '@org-quicko/qpon-sheet-core/redemption_workbook/beans';
import { actionsType } from '../types/actions';
import { roleEnum } from '../../enums';
import { CreateUserDto, UserDto } from '../../dtos/user.dto';

export type subjectsType =
  | InferSubjects<
      | typeof OrganizationUserDto
      | typeof OrganizationDto
      | typeof UserDto
      | typeof CreateUserDto
      | typeof CreateOrganizationDto
      | typeof CustomerDto
      | typeof CreateCustomerDto
      | typeof UpdateCustomerDto
      | typeof ItemDto
      | typeof CreateItemDto
      | typeof UpdateItemDto
      | typeof CouponDto
      | typeof CreateCouponDto
      | typeof UpdateCouponDto
      | typeof CouponSummaryRow
      | typeof CouponItemDto
      | typeof CreateCouponItemDto
      | typeof UpdateCouponItemDto
      | typeof CampaignSummaryRow
      | typeof UpdateCampaignDto
      | typeof CampaignSummaryRow
      | typeof CouponCodeDto
      | typeof UpdateCouponCodeDto
      | typeof CreateCouponCodeDto
      | typeof CustomerCouponCodeDto
      | typeof UpdateCustomerCouponCodeDto
      | typeof CreateCustomerCouponCodeDto
      | typeof RedemptionRow
    >
  | 'all';

export type UserAbilityTuple = [actionsType, subjectsType];
export type UserAbility = MongoAbility<UserAbilityTuple>;

export function defineUserAbilities(role: roleEnum): UserAbility {
  const {
    can: allow,
    cannot: forbid,
    build,
  } = new AbilityBuilder<UserAbility>(createMongoAbility);

  if (role == roleEnum.SUPER_ADMIN) {
    allow('manage', 'all');
  } else {
    // Base permissions for all roles
    allow(
      ['read', 'read_all'],
      [
        OrganizationDto,
        OrganizationUserDto,
        CustomerDto,
        ItemDto,
        CouponDto,
        CouponSummaryRow,
        CampaignDto,
        CampaignSummaryRow,
        CouponItemDto,
        CouponCodeDto,
        RedemptionRow,
        UserDto,
      ]
    );

    forbid(
      ['create', 'delete'],
      [OrganizationDto, CreateOrganizationDto]
    ).because('Only super admin can create or delete an organization');

    forbid(
      [
        'create',
        'update',
        'delete',
        'invite_user',
        'remove_user',
        'change_role',
      ],
      [
        CustomerDto,
        ItemDto,
        CouponCodeDto,
        CouponDto,
        CouponItemDto,
        CampaignDto,
        CreateCustomerDto,
        UpdateCustomerDto,
        CreateItemDto,
        UpdateItemDto,
        UpdateCouponDto,
        UpdateCampaignDto,
        UpdateCouponCodeDto,
        CreateCouponItemDto,
        UpdateCouponItemDto,
        CreateCampaignDto,
        UpdateCampaignDto,
        CreateCouponCodeDto,
        UpdateCouponCodeDto,
        CreateCustomerCouponCodeDto,
        UpdateCustomerCouponCodeDto,
        CreateUserDto,
        CreateOrganizationDto,
        CreateCouponDto
      ]
    ).because('Only editors and admins are allowed to edit, create or delete.');

    forbid('change_role', OrganizationUserDto).because(
      'Only admins are allowed to change role of a user.'
    );

    forbid(['invite_user', 'remove_user'], [CreateUserDto, UserDto]).because(
      'Only admins are allowed to invite or remove the user from organization'
    );

    if(role === roleEnum.ADMIN) {
      allow('manage', [
        CreateCustomerDto,
        UpdateCustomerDto,
        CustomerDto, 
        CreateItemDto,
        UpdateItemDto,
        ItemDto,
        CreateCouponDto,
        UpdateCouponDto,
        CouponDto,
        CreateCouponItemDto,
        UpdateCouponItemDto,
        CouponItemDto,
        CreateCampaignDto,
        UpdateCampaignDto,
        CampaignDto,
        CampaignSummaryRow,
        CouponSummaryRow,
        CreateCouponCodeDto,
        UpdateCouponCodeDto,
        CouponCodeDto,
        CreateCustomerCouponCodeDto,
        UpdateCustomerCouponCodeDto,
        CustomerCouponCodeDto,
        RedemptionRow,
        CreateUserDto,
        UserDto,
        OrganizationDto,
        OrganizationUserDto
      ])
    } else if(role === roleEnum.EDITOR) {
      allow('manage', [
        CreateCustomerDto,
        UpdateCustomerDto,
        CustomerDto, 
        CreateItemDto,
        UpdateItemDto,
        ItemDto,
        CreateCouponDto,
        UpdateCouponDto,
        CouponDto,
        CreateCouponItemDto,
        UpdateCouponItemDto,
        CouponItemDto,
        CreateCampaignDto,
        UpdateCampaignDto,
        CampaignDto,
        CampaignSummaryRow,
        CouponSummaryRow,
        CreateCouponCodeDto,
        UpdateCouponCodeDto,
        CouponCodeDto,
        CreateCustomerCouponCodeDto,
        UpdateCustomerCouponCodeDto,
        CustomerCouponCodeDto,
        RedemptionRow,
        UserDto,
      ])
    }
  }

  return build({
    detectSubjectType: (item) =>
      item.constructor as ExtractSubjectType<subjectsType>,
  });
}
