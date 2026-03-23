import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateToolRegistryEntryDto {
  @IsString()
  @MinLength(1)
  toolCode!: string;

  @IsString()
  @MinLength(1)
  toolVersion!: string;

  @IsString()
  capabilityCode!: string;

  @IsString()
  toolType!: string;

  @IsIn([
    'READ_ONLY',
    'DRAFT_ONLY',
    'WRITE_WITH_CONFIRMATION',
    'AUTO_EXECUTABLE_LOW_RISK',
  ])
  riskLevel!: 'READ_ONLY' | 'DRAFT_ONLY' | 'WRITE_WITH_CONFIRMATION' | 'AUTO_EXECUTABLE_LOW_RISK';

  @IsIn(['SUGGEST', 'CONFIRM_THEN_EXECUTE', 'AUTO_EXECUTE'])
  executionMode!: 'SUGGEST' | 'CONFIRM_THEN_EXECUTE' | 'AUTO_EXECUTE';

  @IsIn(['DRAFT', 'REVIEWED', 'CERTIFIED', 'PRODUCTION', 'DEPRECATED'])
  certificationStatus!: 'DRAFT' | 'REVIEWED' | 'CERTIFIED' | 'PRODUCTION' | 'DEPRECATED';

  @IsString()
  tenantScopeMode!: string;

  @IsArray()
  permissionsRequired!: string[];

  @IsOptional()
  @IsBoolean()
  requiresProvider?: boolean;

  @IsString()
  rollbackStrategy!: string;

  @IsString()
  inputContractRef!: string;

  @IsString()
  outputContractRef!: string;
}
