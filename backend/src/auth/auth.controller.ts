import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { CurrentSession } from '../common/decorators/current-session.decorator';
import { Public } from '../common/decorators/public.decorator';
import type { SessionPrincipal } from '../common/interfaces/session-principal.interface';
import { AuthService } from './auth.service';
import { ExchangeFirebaseTokenDto } from './dto/exchange-firebase-token.dto';
import { RefreshSessionDto } from './dto/refresh-session.dto';
import { UpdateUiProfileDto } from './dto/update-ui-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('firebase/exchange')
  exchangeFirebaseToken(@Body() dto: ExchangeFirebaseTokenDto) {
    return this.authService.exchangeFirebaseToken(
      dto.firebaseIdToken,
      dto.inviteToken,
    );
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshSessionDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Public()
  @Post('logout')
  logout(@Body() dto: RefreshSessionDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Get('me')
  me(@CurrentSession() session: SessionPrincipal) {
    return session;
  }

  @Get('me/ui-profile')
  getUiProfile(@CurrentSession() session: SessionPrincipal) {
    return this.authService.getUiProfile(session.userId, session.tenantId);
  }

  @Patch('me/ui-profile')
  updateUiProfile(
    @CurrentSession() session: SessionPrincipal,
    @Body() dto: UpdateUiProfileDto,
  ) {
    return this.authService.updateUiProfile(
      session.userId,
      session.tenantId,
      session.role,
      dto,
    );
  }
}
