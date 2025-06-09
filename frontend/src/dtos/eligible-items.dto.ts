import { Expose, Transform } from "class-transformer";
import { IsUUID } from "class-validator";

export class CouponItemDto {
    @Expose({ name: 'coupon_id' })
    @Transform(({ value }) => value, { toClassOnly: true })
    @IsUUID()
    couponId: string;
  
    @IsArray()
    item: ItemDto[];
  }
  
  export class CreateCouponItemDto {
    @IsArray()
    items: string[];
  }