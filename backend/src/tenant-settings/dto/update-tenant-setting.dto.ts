import { IsObject, IsString, MinLength } from 'class-validator';

export class UpdateTenantSettingDto {
  @IsString()
  @MinLength(1)
  settingGroup!: string;

  @IsString()
  @MinLength(1)
  settingKey!: string;

  @IsObject()
  settingValueJson!: Record<string, unknown>;
}
