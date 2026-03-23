import { IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCaseDto {
  @IsString()
  @MinLength(1)
  caseType!: string;

  @IsString()
  @MinLength(1)
  priorityCode!: string;

  @IsOptional()
  @IsString()
  requesterUserId?: string;

  @IsOptional()
  @IsString()
  createdFromConversationId?: string;

  @IsOptional()
  @IsObject()
  initialContextJson?: Record<string, unknown>;
}
