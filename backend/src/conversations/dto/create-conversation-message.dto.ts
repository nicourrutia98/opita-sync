import { IsBoolean, IsEnum, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateConversationMessageDto {
  @IsEnum(['USER', 'ASSISTANT', 'SYSTEM'])
  senderType!: 'USER' | 'ASSISTANT' | 'SYSTEM';

  @IsOptional()
  @IsString()
  senderRef?: string;

  @IsString()
  @MinLength(1)
  contentText!: string;

  @IsOptional()
  @IsObject()
  contentStructuredJson?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  isSensitive?: boolean;
}
