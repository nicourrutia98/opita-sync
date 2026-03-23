import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { ToolRegistryController } from './tool-registry.controller';
import { ToolRegistryService } from './tool-registry.service';

@Module({
  imports: [AuditModule],
  controllers: [ToolRegistryController],
  providers: [ToolRegistryService],
  exports: [ToolRegistryService],
})
export class ToolRegistryModule {}
