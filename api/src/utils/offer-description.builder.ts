import { discountTypeEnum } from '../enums';
import { Offer } from '../entities/offer.view';

export const offerDescriptionBuilder = (offer: Offer): string => {
  let description = '';

  if (offer.discountType == discountTypeEnum.PERCENTAGE) {
    if (offer.expiresAt && offer.minimumAmount > 0) {
      if (offer.discountUpto > 0) {
        description = `Get ${offer.discountValue}% off on purchases above ₹${offer.minimumAmount}, with a maximum discount of ₹${offer.discountUpto}. Offer valid till ${offer.expiresAt.toDateString()}.`;
      } else {
        description = `Get ${offer.discountValue}% off on purchases above ₹${offer.minimumAmount}. Offer valid till ${offer.expiresAt.toDateString()}.`;
      }
    } else if (offer.minimumAmount > 0) {
      if (offer.discountUpto > 0) {
        description = `Get ${offer.discountValue}% off on purchases above ₹${offer.minimumAmount}, upto ₹${offer.discountUpto} maximum discount.`;
      } else {
        description = `Get ${offer.discountValue}% off on purchases above ₹${offer.minimumAmount}.`;
      }
    } else if (offer.expiresAt) {
      description = `Get ${offer.discountValue}% off on purchases. Offer valid till ${offer.expiresAt.toDateString()}.`;
    } else {
      if (offer.discountUpto > 0) {
        description = `Get ${offer.discountValue}% off on purchases, upto ₹${offer.discountUpto} maximum discount.`;
      } else {
        description = `Get ${offer.discountValue}% off on purchases.`;
      }
    }
  } else {
    if (offer.expiresAt && offer.minimumAmount > 0) {
      description = `Get ₹${offer.discountValue} off on your purchases above ₹${offer.minimumAmount}, offer valid till ${offer.expiresAt.toDateString()}`;
    } else if (offer.minimumAmount > 0) {
      description = `Get ₹${offer.discountValue} off on your purchases above ₹${offer.minimumAmount}`;
    } else if (offer.expiresAt) {
      description = `Get ₹${offer.discountValue} off on your purchases, offer valid till ${offer.expiresAt.toDateString()}`;
    } else {
      description = `Get ₹${offer.discountValue} off on your purchases`;
    }
  }

  return description;
};
