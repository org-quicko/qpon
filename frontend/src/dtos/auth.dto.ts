import { email, prop, required } from '@rxweb/reactive-form-validators';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginCredentialDto {
  @prop()
  @required()
  @email()
  @IsEmail()
  @IsNotEmpty()
  email?: string;

  @prop()
  @required()
  @IsString()
  @IsNotEmpty()
  password?: string;
}
