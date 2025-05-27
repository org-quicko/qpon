import { Injectable } from '@nestjs/common';
import { JSONArray, JSONObject } from '@org-quicko/core';
import {
  OfferRow,
  OfferWorkbook,
} from 'generated/sources/offer_workbook';
import { Offer } from '../entities/offer.view';
import { offerDescriptionBuilder } from '../utils/offer-description.builder';
import { offerTitleBuilder } from '../utils/offer-title.builder';

@Injectable()
export class OfferSheetConverter {
  convert(
    offers: Offer[],
    organizationId: string,
    skip?: number,
    take?: number,
  ): OfferWorkbook {
    const offerWorkbook = new OfferWorkbook();

    const offerSheet = offerWorkbook.getOfferSheet();
    const offerTable = offerSheet.getOfferTable();

      for (let index = 0; index < offers.length; index++) {
        const offer = offers[index];
        const offerRow = new OfferRow(new JSONArray());
        const title = offerTitleBuilder(offer);
        const description = offerDescriptionBuilder(offer);

        offerRow.setTitle(title);
        offerRow.setDescription(description);
        offerRow.setCouponCode(offer.code);
        offerRow.setDiscountType(offer.discountType);
        offerRow.setDiscountValue(offer.discountValue);
        offerRow.setDiscountUpto(offer.discountUpto);
        offerRow.setItemConstraint(offer.itemConstraint);
        offerRow.setMinimumAmount(offer.minimumAmount);
        offerRow.setCustomerId(offer.customerId);
        offerRow.setCampaignExternalId(offer.externalCampaignId);
        offerRow.setVisibility(offer.visibility);
        offerRow.setCampaignId(offer.campaignId);
        offerRow.setCouponId(offer.couponId);

        if (offer.expiresAt) {
          offerRow.setExpiresAt(offer.expiresAt.toISOString());
        }
        offerTable.addRow(offerRow);
      }

    if (skip! >= 0 && take! > 0) {
      offerWorkbook.setMetadata(new JSONObject({
        organization_id: organizationId,
        skip,
        take,
      }));
    } else {
      offerWorkbook.setMetadata(new JSONObject({
        organization_id: organizationId,
      }));
    }

    return offerWorkbook;
  }
}
