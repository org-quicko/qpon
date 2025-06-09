import { Offer } from '../entities/offer.view';
import { discountTypeEnum } from '../enums';

export const offerTitleBuilder = (offer: Offer): string => {
  let title = '';

  if (offer.discountType == discountTypeEnum.FIXED) {
    title = `₹${offer.discountValue} off`;
  } else {
    title = `${offer.discountValue}% off`;
  }

  return title;
};
