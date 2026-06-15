import 'reflect-metadata';
import { Expose, Transform } from 'class-transformer';
import { Equals, IsDate, IsString } from 'class-validator';
import { Role } from '../enums';

@Reflect.metadata('@entity', 'org.quicko.qpon.organization_user')
export class OrganizationUser {
  @Expose({ name: '@entity' })
  @Equals('org.quicko.qpon.organization_user')
  entity = 'org.quicko.qpon.organization_user';

  @Expose({ name: 'organization_id' })
  @Transform(({ value }) => value, { toClassOnly: true })
  organizationId?: string;

  @IsString()
  name?: string;

  @IsString()
  role?: Role;

  @Expose({ name: 'created_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  createdAt?: Date;

  @Expose({ name: 'updated_at' })
  @Transform(({ value }) => value, { toClassOnly: true })
  @IsDate()
  updatedAt?: Date;

  getOrganizationId(): string | undefined {
    return this.organizationId;
  }

  setOrganizationId(organizationId: string): void {
    this.organizationId = organizationId;
  }

  getName(): string | undefined {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }

  getRole(): Role | undefined {
    return this.role;
  }

  setRole(role: Role): void {
    this.role = role;
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
