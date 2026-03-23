import {
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const colorThemeModes = ['light', 'dark', 'system'] as const;
const contrastModes = ['standard', 'high'] as const;
const focusIndicatorModes = ['standard', 'strong'] as const;
const contentDensities = ['compact', 'comfortable'] as const;
const fontScales = ['compact', 'normal', 'large'] as const;
const spacingModes = ['normal', 'relaxed'] as const;
const reducedMotionModes = ['on', 'off', 'system'] as const;
const formAssistanceModes = ['standard', 'guided'] as const;

export class UpdateTenantBrandingDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  appName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  brandOwner?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  shortMark?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  supportContact?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  legalFooterText?: string;
}

export class UpdateTenantThemeDefaultsDto {
  @IsOptional()
  @IsIn(colorThemeModes)
  colorThemeMode?: (typeof colorThemeModes)[number];

  @IsOptional()
  @IsIn(contrastModes)
  contrastMode?: (typeof contrastModes)[number];

  @IsOptional()
  @IsIn(focusIndicatorModes)
  focusIndicatorMode?: (typeof focusIndicatorModes)[number];

  @IsOptional()
  @IsIn(contentDensities)
  contentDensity?: (typeof contentDensities)[number];
}

export class UpdateTenantAccessibilityDefaultsDto {
  @IsOptional()
  @IsIn(fontScales)
  fontScale?: (typeof fontScales)[number];

  @IsOptional()
  @IsIn(spacingModes)
  lineSpacingMode?: (typeof spacingModes)[number];

  @IsOptional()
  @IsIn(spacingModes)
  letterSpacingMode?: (typeof spacingModes)[number];

  @IsOptional()
  @IsIn(reducedMotionModes)
  reducedMotion?: (typeof reducedMotionModes)[number];

  @IsOptional()
  @IsIn(formAssistanceModes)
  formAssistanceMode?: (typeof formAssistanceModes)[number];
}

export class UpdateTenantUiBaselineDto {
  @IsOptional()
  @IsObject()
  branding?: UpdateTenantBrandingDto;

  @IsOptional()
  @IsObject()
  themeDefaults?: UpdateTenantThemeDefaultsDto;

  @IsOptional()
  @IsObject()
  accessibilityDefaults?: UpdateTenantAccessibilityDefaultsDto;
}
