import { useQuery } from "@tanstack/react-query";
import type { ConversationSummary } from "../domain/opita";
import type { ChatTransport } from "../domain/opita";

export const recentChatsQueryKey = ["recent-chats"] as const;

export function useRecentChats(transport: ChatTransport, limit = 20) {
  return useQuery<ConversationSummary[]>({
    queryKey: [...recentChatsQueryKey, limit],
    queryFn: () => transport.listConversations({ limit }),
    staleTime: 15_000
  });
}
