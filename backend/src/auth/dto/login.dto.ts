import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @IsString()
  @Length(6, 6)
  code: string;
}
