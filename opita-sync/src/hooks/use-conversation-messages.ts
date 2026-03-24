import { useInfiniteQuery } from "@tanstack/react-query";
import type { ChatMessage, ChatTransport } from "../domain/opita";

export const conversationMessagesQueryKey = (conversationId: string) => ["conversation-messages", conversationId] as const;

function sortMessages(messages: ChatMessage[]) {
  return [...messages].sort((left, right) => {
    if (left.createdAt === right.createdAt) {
      return left.id.localeCompare(right.id);
    }
    return left.createdAt.localeCompare(right.createdAt);
  });
}

export function useConversationMessages(transport: ChatTransport, conversationId: string | null, limit = 30) {
  const query = useInfiniteQuery({
    queryKey: conversationId ? conversationMessagesQueryKey(conversationId) : ["conversation-messages", "empty"],
    enabled: Boolean(conversationId),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => transport.getConversationMessages({ conversationId: conversationId!, limit, before: pageParam ?? undefined }),
    getNextPageParam: (lastPage) => (lastPage.hasMoreBefore ? lastPage.prevCursor : undefined),
    staleTime: 10_000
  });

  return {
    ...query,
    messages: sortMessages((query.data?.pages ?? []).flatMap((page) => page.items))
  };
}
