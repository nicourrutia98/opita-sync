import { Module } from '@nestjs/common';
import { CasesModule } from '../cases/cases.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { IdentityAccessModule } from '../identity-access/identity-access.module';
import { TenantSettingsModule } from '../tenant-settings/tenant-settings.module';
import { ContextBuilderController } from './context-builder.controller';
import { ContextBuilderService } from './context-builder.service';

@Module({
  imports: [
    TenantSettingsModule,
    IdentityAccessModule,
    ConversationsModule,
    CasesModule,
  ],
  controllers: [ContextBuilderController],
  providers: [ContextBuilderService],
  exports: [ContextBuilderService],
})
export class ContextBuilderModule {}
