import { prop } from '@rxweb/reactive-form-validators';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginCredentialDto {
  @prop()
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @prop()
  @IsString()
  @IsNotEmpty()
  password?: string;
}
