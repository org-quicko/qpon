import { discountTypeEnum, itemConstraintEnum, sortOrderEnum, statusEnum } from "../../enums";

export interface CouponFilter {
  query?: string | null;
  status?: statusEnum | null;
  itemConstraint?: itemConstraintEnum | null;
  discountType?: discountTypeEnum | null;
  sortBy?: string;
  sortOrder?: sortOrderEnum;
}
