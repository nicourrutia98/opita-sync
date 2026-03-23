import {
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const preferenceValues = {
  fontScale: ['compact', 'normal', 'large', 'x-large'],
  lineSpacingMode: ['normal', 'relaxed'],
  letterSpacingMode: ['normal', 'relaxed'],
  contrastMode: ['system', 'standard', 'high'],
  colorThemeMode: ['system', 'light', 'dark'],
  focusIndicatorMode: ['standard', 'strong'],
  reducedMotion: ['system', 'on', 'off'],
  contentDensity: ['compact', 'comfortable'],
  iconLabelMode: ['auto', 'always'],
  messageWidthMode: ['standard', 'wide'],
  formAssistanceMode: ['standard', 'guided'],
  screenReaderHints: ['auto', 'on', 'off'],
} as const;

export class UpdateAccessibilityOverridesDto {
  @IsOptional()
  @IsIn(preferenceValues.fontScale)
  fontScale?: (typeof preferenceValues.fontScale)[number];

  @IsOptional()
  @IsIn(preferenceValues.lineSpacingMode)
  lineSpacingMode?: (typeof preferenceValues.lineSpacingMode)[number];

  @IsOptional()
  @IsIn(preferenceValues.letterSpacingMode)
  letterSpacingMode?: (typeof preferenceValues.letterSpacingMode)[number];

  @IsOptional()
  @IsIn(preferenceValues.contrastMode)
  contrastMode?: (typeof preferenceValues.contrastMode)[number];

  @IsOptional()
  @IsIn(preferenceValues.colorThemeMode)
  colorThemeMode?: (typeof preferenceValues.colorThemeMode)[number];

  @IsOptional()
  @IsIn(preferenceValues.focusIndicatorMode)
  focusIndicatorMode?: (typeof preferenceValues.focusIndicatorMode)[number];

  @IsOptional()
  @IsIn(preferenceValues.reducedMotion)
  reducedMotion?: (typeof preferenceValues.reducedMotion)[number];

  @IsOptional()
  @IsIn(preferenceValues.contentDensity)
  contentDensity?: (typeof preferenceValues.contentDensity)[number];

  @IsOptional()
  @IsIn(preferenceValues.iconLabelMode)
  iconLabelMode?: (typeof preferenceValues.iconLabelMode)[number];

  @IsOptional()
  @IsIn(preferenceValues.messageWidthMode)
  messageWidthMode?: (typeof preferenceValues.messageWidthMode)[number];

  @IsOptional()
  @IsIn(preferenceValues.formAssistanceMode)
  formAssistanceMode?: (typeof preferenceValues.formAssistanceMode)[number];

  @IsOptional()
  @IsIn(preferenceValues.screenReaderHints)
  screenReaderHints?: (typeof preferenceValues.screenReaderHints)[number];
}

export class UpdateUiProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(24)
  locale?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;

  @IsOptional()
  @IsObject()
  accessibilityOverrides?: UpdateAccessibilityOverridesDto;
}
