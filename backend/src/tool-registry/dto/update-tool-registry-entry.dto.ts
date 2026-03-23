import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateToolRegistryEntryDto {
  @IsOptional()
  @IsString()
  capabilityCode?: string;

  @IsOptional()
  @IsString()
  toolType?: string;

  @IsOptional()
  @IsIn([
    'READ_ONLY',
    'DRAFT_ONLY',
    'WRITE_WITH_CONFIRMATION',
    'AUTO_EXECUTABLE_LOW_RISK',
  ])
  riskLevel?: 'READ_ONLY' | 'DRAFT_ONLY' | 'WRITE_WITH_CONFIRMATION' | 'AUTO_EXECUTABLE_LOW_RISK';

  @IsOptional()
  @IsIn(['SUGGEST', 'CONFIRM_THEN_EXECUTE', 'AUTO_EXECUTE'])
  executionMode?: 'SUGGEST' | 'CONFIRM_THEN_EXECUTE' | 'AUTO_EXECUTE';

  @IsOptional()
  @IsIn(['DRAFT', 'REVIEWED', 'CERTIFIED', 'PRODUCTION', 'DEPRECATED'])
  certificationStatus?: 'DRAFT' | 'REVIEWED' | 'CERTIFIED' | 'PRODUCTION' | 'DEPRECATED';

  @IsOptional()
  @IsString()
  tenantScopeMode?: string;

  @IsOptional()
  @IsArray()
  permissionsRequired?: string[];

  @IsOptional()
  @IsBoolean()
  requiresProvider?: boolean;

  @IsOptional()
  @IsString()
  rollbackStrategy?: string;

  @IsOptional()
  @IsString()
  inputContractRef?: string;

  @IsOptional()
  @IsString()
  outputContractRef?: string;
}
