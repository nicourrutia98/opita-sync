import { IsOptional, IsString, MinLength } from 'class-validator';

export class ExchangeFirebaseTokenDto {
  @IsString()
  @MinLength(10)
  firebaseIdToken!: string;

  @IsOptional()
  @IsString()
  inviteToken?: string;
}
