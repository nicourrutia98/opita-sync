import { useMemo } from "react";
import type { ChatTransport } from "../domain/opita";
import type { OpitaAppServices } from "../services/contracts";

export function useChatTransport(services: OpitaAppServices): ChatTransport {
  return useMemo(
    () => ({
      listConversations: services.chatService.listConversations,
      createConversation: services.chatService.createConversation,
      updateConversation: services.chatService.updateConversation,
      getConversationMessages: services.chatService.getConversationMessages,
      sendMessage: services.chatService.sendMessage,
      retryLastMessage: services.chatService.retryLastMessage,
      streamAssistantResponse: services.chatService.streamAssistantResponse,
      cancelRun: services.chatService.cancelRun,
      subscribeConversationUpdates: services.chatService.subscribeConversationUpdates
    }),
    [services]
  );
}
