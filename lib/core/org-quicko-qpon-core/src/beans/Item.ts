import { Expose, Transform } from 'class-transformer';
import { IsString, IsDate, IsUUID, IsOptional } from 'class-validator';

export class Item {
  @Expose({ name: 'item_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsUUID()
  itemId?: string;

  @IsString()
  name?: string;

  @IsString()
  description?: string;

  @IsOptional()
  @Expose({ name: 'custom_fields' })
  @Transform(({ value }) => value, { toClassOnly: true })
  customFields?: object;

  @Expose({ name: 'external_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  externalId?: string;

  @Expose({ name: 'created_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  createdAt?: Date;

  @Expose({ name: 'updated_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  updatedAt?: Date;

  getItemId(): string | undefined {
    return this.itemId;
  }

  setItemId(itemId: string): void {
    this.itemId = itemId;
  }

  getName(): string | undefined {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }

  getDescription(): string | undefined {
    return this.description;
  }

  setDescription(description: string): void {
    this.description = description;
  }

  getCustomFields(): object | undefined {
    return this.customFields;
  }

  setCustomFields(customFields: object): void {
    this.customFields = customFields;
  }

  getExternalId(): string | undefined {
    return this.externalId;
  }

  setExternalId(externalId: string): void {
    this.externalId = externalId;
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