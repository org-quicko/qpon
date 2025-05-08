import { Injectable } from '@nestjs/common';
import { JSONObject } from '@org.quicko/core';
import {
  OfferRow,
  OfferSheet,
  OfferTable,
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
    const offerTable = new OfferTable();
    offers.map((offer) => {
      const offerRow = new OfferRow([]);
      const title = offerTitleBuilder(offer);
      const description = offerDescriptionBuilder(offer);

      offerRow.setTitle(title);
      offerRow.setDescription(description);
      offerRow.setCouponCode(offer.code);
      offerRow.setDiscountType(offer.discountType);
      offerRow.setDiscountValue(offer.discountValue);
      offerRow.setItemConstraint(offer.itemConstraint);
      offerRow.setMinimumAmount(offer.minimumAmount);
      offerRow.setCustomerId(offer.customerId);
      offerRow.setCampaignExternalId(offer.externalCampaignId);
      offerRow.setVisibility(offer.visibility);
      offerRow.setCampaignId(offer.campaignId);
      offerRow.setCouponId(offer.couponId);
      offerRow.setExpiresAt(offer.expiresAt.toString());
      offerTable.addRow(offerRow);
    });

    const offerSheet = new OfferSheet();
    offerSheet.addOfferTable(offerTable);

    const offerWorkbook = new OfferWorkbook();
    offerWorkbook.addOfferSheet(offerSheet);

    if (skip! >= 0 && take! > 0) {
      offerWorkbook.metadata = new JSONObject({
        organization_id: organizationId,
        skip,
        take,
      });
    } else {
      offerWorkbook.metadata = new JSONObject({
        organization_id: organizationId,
      });
    }

    return offerWorkbook;
  }
}
