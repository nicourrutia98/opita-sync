import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

export function useChatScrollController({
  conversationId,
  itemCount,
  hasMoreBefore,
  isFetchingOlder,
  onLoadOlder
}: {
  conversationId: string | null;
  itemCount: number;
  hasMoreBefore: boolean;
  isFetchingOlder: boolean;
  onLoadOlder: () => Promise<unknown>;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  const nearBottomRef = useRef(true);
  const prependAnchorRef = useRef<number | null>(null);
  const lastConversationRef = useRef<string | null>(null);
  const [showNewMessages, setShowNewMessages] = useState(false);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (!containerRef.current) {
      return;
    }
    containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior });
    nearBottomRef.current = true;
    setShowNewMessages(false);
  }, []);

  const prepareForPrepend = useCallback(() => {
    if (!containerRef.current) {
      return;
    }
    prependAnchorRef.current = containerRef.current.scrollHeight;
  }, []);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) {
      return;
    }
    const distanceToBottom = containerRef.current.scrollHeight - containerRef.current.scrollTop - containerRef.current.clientHeight;
    nearBottomRef.current = distanceToBottom < 96;
    if (nearBottomRef.current) {
      setShowNewMessages(false);
    }
  }, []);

  const loadOlder = useCallback(async () => {
    if (!hasMoreBefore || isFetchingOlder) {
      return;
    }
    prepareForPrepend();
    await onLoadOlder();
  }, [hasMoreBefore, isFetchingOlder, onLoadOlder, prepareForPrepend]);

  useEffect(() => {
    if (!topSentinelRef.current || !containerRef.current) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadOlder();
        }
      },
      { root: containerRef.current, threshold: 0.1 }
    );
    observer.observe(topSentinelRef.current);
    return () => observer.disconnect();
  }, [loadOlder]);

  useLayoutEffect(() => {
    if (!conversationId || !containerRef.current) {
      return;
    }
    if (lastConversationRef.current !== conversationId) {
      lastConversationRef.current = conversationId;
      requestAnimationFrame(() => scrollToBottom("auto"));
      return;
    }

    if (prependAnchorRef.current != null && !isFetchingOlder) {
      const nextHeight = containerRef.current.scrollHeight;
      const delta = nextHeight - prependAnchorRef.current;
      containerRef.current.scrollTop += delta;
      prependAnchorRef.current = null;
      return;
    }

    if (nearBottomRef.current) {
      requestAnimationFrame(() => scrollToBottom("auto"));
    } else {
      setShowNewMessages(true);
    }
  }, [conversationId, isFetchingOlder, itemCount, scrollToBottom]);

  return useMemo(
    () => ({
      containerRef,
      topSentinelRef,
      showNewMessages,
      handleScroll,
      scrollToBottom,
      loadOlder
    }),
    [handleScroll, loadOlder, scrollToBottom, showNewMessages]
  );
}
