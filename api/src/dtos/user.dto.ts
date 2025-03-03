import { PartialType } from '@nestjs/mapped-types';
import { Expose, Transform } from 'class-transformer';
import { IsString, IsNumber, IsArray, ValidateNested, IsEnum, IsDate, IsUUID, IsOptional } from 'class-validator';

export class UserDto {
    @Expose({ name: 'user_id' })
    @Transform(({ value }) => value, { toClassOnly: true })
    @IsUUID()
    userId: string;

    @IsString()
    name: string;

    @IsString()
    email: string;

    @IsString()
    password: string;

    @Expose({name: 'created_at'})
    @Transform(({ value }) => value, { toClassOnly: true })
    @IsDate()
    createdAt: Date;

    @Expose({name: 'updated_at'})
    @Transform(({ value }) => value, { toClassOnly: true })
    @IsDate()
    updatedAt: Date;
}

export class CreateUserDto {
    @IsString()
    name: string;

    @IsString()
    email: string;

    @IsString()
    password: string;

}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

