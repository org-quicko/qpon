import { Expose, Transform } from "class-transformer";
import { IsString, IsNumber, IsEnum, IsDate, IsUUID } from "class-validator";
import { ItemConstraint, DiscountType, Status } from "../enums";

export class Coupon {
	@Expose({ name: "coupon_id" })
	@Transform(({ value }) => value, { toClassOnly: true })
	@IsUUID()
	couponId?: string;

	@IsString()
	name?: string;

	@Expose({ name: "discount_type" })
	@Transform(({ value }) => value, { toClassOnly: true })
	@IsEnum(DiscountType)
	discountType?: DiscountType;

	@Expose({ name: "discount_value" })
	@Transform(({ value }) => value, { toClassOnly: true })
	@IsNumber()
	discountValue?: number;

	@Expose({ name: "discount_upto" })
	@Transform(({ value }) => value, { toClassOnly: true })
	@IsNumber()
	discountUpto?: number;

	@Expose({ name: "item_constraint" })
	@Transform(({ value }) => value, { toClassOnly: true })
	@IsEnum(ItemConstraint)
	itemConstraint?: ItemConstraint;

	@IsEnum(Status)
	status?: Status;

	@Expose({ name: "created_at" })
	@Transform(({ value }) => value, { toClassOnly: true })
	@IsDate()
	createdAt?: Date;

	@Expose({ name: "updated_at" })
	@Transform(({ value }) => value, { toClassOnly: true })
	@IsDate()
	updatedAt?: Date;
}
