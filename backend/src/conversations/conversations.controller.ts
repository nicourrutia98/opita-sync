import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentSession } from '../common/decorators/current-session.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import type { SessionPrincipal } from '../common/interfaces/session-principal.interface';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateConversationMessageDto } from './dto/create-conversation-message.dto';
import { ConversationsService } from './conversations.service';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Get()
  @Permissions('conversation.read')
  listConversations(@CurrentSession() session: SessionPrincipal) {
    return this.conversationsService.listConversations(session.tenantId, session.userId);
  }

  @Post()
  @Permissions('conversation.create')
  create(
    @CurrentSession() session: SessionPrincipal,
    @Body() dto: CreateConversationDto,
  ) {
    return this.conversationsService.createConversation(
      session.tenantId,
      session.userId,
      session.role,
      dto.title,
      dto.activeCaseId,
    );
  }

  @Get(':id')
  @Permissions('conversation.read')
  getConversation(
    @CurrentSession() session: SessionPrincipal,
    @Param('id') conversationId: string,
  ) {
    return this.conversationsService.getConversation(session.tenantId, conversationId);
  }

  @Get(':id/messages')
  @Permissions('conversation.read')
  listMessages(
    @CurrentSession() session: SessionPrincipal,
    @Param('id') conversationId: string,
  ) {
    return this.conversationsService.listMessages(session.tenantId, conversationId);
  }

  @Post(':id/messages')
  @Permissions('conversation.write')
  appendMessage(
    @CurrentSession() session: SessionPrincipal,
    @Param('id') conversationId: string,
    @Body() dto: CreateConversationMessageDto,
  ) {
    return this.conversationsService.appendMessage(
      session.tenantId,
      session.userId,
      session.role,
      conversationId,
      dto.senderType,
      dto.contentText,
      dto.senderRef,
      dto.contentStructuredJson,
      dto.isSensitive,
    );
  }

  @Post(':id/summaries/rebuild')
  @Permissions('conversation.summarize')
  rebuildSummary(
    @CurrentSession() session: SessionPrincipal,
    @Param('id') conversationId: string,
  ) {
    return this.conversationsService.rebuildSummary(session.tenantId, conversationId);
  }
}
