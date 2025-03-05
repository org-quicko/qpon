import { discountTypeEnum, statusEnum } from '../enums';

export interface QueryOptionsInterface {
  externalId?: string;
  externalItemId?: string;
  discountType?: discountTypeEnum;
  status?: statusEnum;
  name?: string;

  skip?: number;
  take?: number;
}
