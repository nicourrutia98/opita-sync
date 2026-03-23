import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { SystemService } from './system.service';

@Controller()
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Public()
  @Get('health')
  getHealth() {
    return this.systemService.getHealth();
  }

  @Public()
  @Get('ready')
  getReady() {
    return this.systemService.getReadiness();
  }
}
