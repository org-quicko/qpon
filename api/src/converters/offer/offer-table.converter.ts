import { OfferRow, OfferTable } from "@org-quicko/qpon-sheet-core/offer_workbook/beans";
import { JSONArray } from "@org-quicko/core";
import { Offer } from "../../entities/offer.view";
import { offerTitleBuilder } from "../../utils/offer-title.builder";
import { offerDescriptionBuilder } from "../../utils/offer-description.builder";

export class OfferTableConverter {
  convert(offers: Offer[]): OfferTable {

    const offerTable = new OfferTable();

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
    return offerTable;
  }
}
