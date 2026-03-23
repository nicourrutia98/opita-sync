import { IsOptional, IsString } from 'class-validator';

export class ConfirmConfirmationRequestDto {
  @IsOptional()
  @IsString()
  confirmationCode?: string;
}
