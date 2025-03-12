import { discountTypeEnum } from '../enums';
import { Offer } from '../entities/offer.view';

export const offerDescriptionBuilder = (offer: Offer): string => {
  let description = '';

  if (offer.discountType == discountTypeEnum.PERCENTAGE) {
    if (offer.expiresAt && offer.minimumAmount > 0) {
      description = `Get ${offer.discountValue}% off on your purchases above ${offer.minimumAmount}, offer valid till ${offer.expiresAt.toISOString()}`;
    } else if (offer.minimumAmount > 0) {
      description = `Get ${offer.discountValue}% off on your purchases above ₹${offer.minimumAmount}`;
    } else if (offer.expiresAt) {
      description = `Get ${offer.discountValue}% off on your purchases, offer valid till ${offer.expiresAt.toISOString()}`;
    } else {
      description = `Get ${offer.discountValue}% off on your purchases`;
    }
  } else {
    if (offer.expiresAt && offer.minimumAmount > 0) {
      description = `Get ₹${offer.discountValue} off on your purchases above ${offer.minimumAmount}, offer valid till ${offer.expiresAt.toISOString()}`;
    } else if (offer.minimumAmount > 0) {
      description = `Get ₹${offer.discountValue} off on your purchases above ₹${offer.minimumAmount}`;
    } else if (offer.expiresAt) {
      description = `Get ₹${offer.discountValue} off on your purchases, offer valid till ${offer.expiresAt.toISOString()}`;
    } else {
      description = `Get ₹${offer.discountValue} off on your purchases`;
    }
  }

  return description;
};
