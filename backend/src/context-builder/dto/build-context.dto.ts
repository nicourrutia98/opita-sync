import { IsOptional, IsString } from 'class-validator';
import { IsObject } from 'class-validator';

export class BuildContextDto {
  @IsString()
  conversationId!: string;

  @IsOptional()
  @IsString()
  capabilityCode?: string;

  @IsOptional()
  @IsString()
  intentCode?: string;

  @IsOptional()
  @IsString()
  caseId?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsString()
  toolCode?: string;

  @IsOptional()
  @IsString()
  toolVersion?: string;

  @IsOptional()
  @IsString()
  riskLevel?: string;

  @IsOptional()
  @IsString()
  executionMode?: string;

  @IsOptional()
  @IsString()
  caseType?: string;

  @IsOptional()
  @IsString()
  priorityCode?: string;

  @IsOptional()
  @IsObject()
  structuredFields?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  currentUserRequest?: string;
}
