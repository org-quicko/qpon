import { durationTypeEnum, sortOrderEnum, statusEnum, visibilityEnum } from "../../enums";

export interface CouponCodeFilter {
  query?: string;
  status?: statusEnum;
  sortBy?: string;
  sortOrder?: sortOrderEnum;
  visibility?: visibilityEnum;
  durationType?: durationTypeEnum;
}
