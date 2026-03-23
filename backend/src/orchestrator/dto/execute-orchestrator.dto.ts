import { IsObject, IsOptional, IsString } from 'class-validator';

export class ExecuteOrchestratorDto {
  @IsString()
  conversationId!: string;

  @IsString()
  capabilityCode!: string;

  @IsOptional()
  @IsString()
  currentUserRequest?: string;

  @IsOptional()
  @IsString()
  caseId?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsString()
  caseType?: string;

  @IsOptional()
  @IsString()
  priorityCode?: string;

  @IsOptional()
  @IsObject()
  structuredFields?: Record<string, unknown>;
}
