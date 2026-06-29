import 'reflect-metadata';
import { Expose } from 'class-transformer';
import { Equals, IsString, IsDate, IsUUID, IsOptional } from 'class-validator';

@Reflect.metadata('@entity', 'org.quicko.qpon.item')
export class Item {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.item')
  entity = 'org.quicko.qpon.item';

  @Expose({ name: 'item_id' })
  @IsUUID()
  itemId?: string;

  @Expose()
  @IsString()
  name?: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Expose({ name: 'custom_fields' })
  customFields?: object;

  @Expose({ name: 'external_id' })
  @IsString()
  externalId?: string;

  @Expose({ name: 'created_at' })
  @IsDate()
  createdAt?: Date;

  @Expose({ name: 'updated_at' })
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