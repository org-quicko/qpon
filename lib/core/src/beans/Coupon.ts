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

	getCouponId(): string | undefined {
		return this.couponId;
	}

	setCouponId(couponId: string): void {
		this.couponId = couponId;
	}

	getName(): string | undefined {
		return this.name;
	}

	setName(name: string): void {
		this.name = name;
	}

	getDiscountType(): DiscountType | undefined {
		return this.discountType;
	}

	setDiscountType(discountType: DiscountType): void {
		this.discountType = discountType;
	}

	getDiscountValue(): number | undefined {
		return this.discountValue;
	}

	setDiscountValue(discountValue: number): void {
		this.discountValue = discountValue;
	}

	getDiscountUpto(): number | undefined {
		return this.discountUpto;
	}

	setDiscountUpto(discountUpto: number): void {
		this.discountUpto = discountUpto;
	}

	getItemConstraint(): ItemConstraint | undefined {
		return this.itemConstraint;
	}

	setItemConstraint(itemConstraint: ItemConstraint): void {
		this.itemConstraint = itemConstraint;
	}

	getStatus(): Status | undefined {
		return this.status;
	}

	setStatus(status: Status): void {
		this.status = status;
	}

	getCreatedAt(): Date | undefined {
		return this.createdAt;
	}

	setCreatedAt(createdAt: Date): void {
		this.createdAt = createdAt;
	}

	getUpdatedAt(): Date | undefined {
		return this.updatedAt;
	}

	setUpdatedAt(updatedAt: Date): void {
		this.updatedAt = updatedAt;
	}
}
