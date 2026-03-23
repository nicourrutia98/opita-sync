import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateCaseDto {
  @IsOptional()
  @IsEnum(['DRAFT', 'OPEN', 'IN_PROGRESS', 'CLOSED', 'CANCELLED'])
  statusCode?: 'DRAFT' | 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'CANCELLED';

  @IsOptional()
  @IsString()
  ownerUserId?: string;
}
