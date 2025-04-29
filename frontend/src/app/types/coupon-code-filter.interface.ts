import { couponCodeStatusEnum, durationTypeEnum, sortOrderEnum, statusEnum, visibilityEnum } from "../../enums";

export interface CouponCodeFilter {
  query?: string;
  status?: couponCodeStatusEnum;
  visibility?: visibilityEnum;
  durationType?: durationTypeEnum;
}
