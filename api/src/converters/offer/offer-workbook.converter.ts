import { Injectable } from "@nestjs/common";
import { OfferWorkbook } from "@org-quicko/qpon-sheet-core/offer_workbook/beans";
import { Offer } from "../../entities/offer.view";
import { OfferTableConverter } from "./offer-table.converter";
import { JSONObject } from "@org-quicko/core";

@Injectable()
export class OfferWorkbookConverter {

    private offerTableConverter: OfferTableConverter;

    constructor() {
        this.offerTableConverter = new OfferTableConverter();
    }

    convert(offers: Offer[], organizationId: string, skip?: number, take?: number): OfferWorkbook {
        const offerWorkbook = new OfferWorkbook();

        const offerSheet = offerWorkbook.getOfferSheet();


        const offerTable = this.offerTableConverter.convert(offers);

        offerSheet.replaceBlock(offerTable);

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
