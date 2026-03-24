import { useCallback, useEffect, useMemo, useState } from "react";
import type { TTSState } from "../domain/opita";

export function useTTS() {
  const [ttsState, setTtsState] = useState<TTSState>("idle");
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    const updateVoices = () => setVoices(window.speechSynthesis.getVoices());
    updateVoices();
    window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
  }, []);

  const preferredVoice = useMemo(
    () => voices.find((voice) => voice.lang.toLowerCase().startsWith("es")) ?? voices[0] ?? null,
    [voices]
  );

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    setActiveMessageId(null);
    setTtsState("idle");
  }, []);

  const speak = useCallback(
    (messageId: string, text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setTtsState("error");
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        utterance.lang = preferredVoice.lang;
      } else {
        utterance.lang = "es-ES";
      }
      utterance.onstart = () => {
        setActiveMessageId(messageId);
        setTtsState("speaking");
      };
      utterance.onend = () => {
        setActiveMessageId(null);
        setTtsState("idle");
      };
      utterance.onerror = () => {
        setActiveMessageId(null);
        setTtsState("error");
      };
      window.speechSynthesis.speak(utterance);
    },
    [preferredVoice]
  );

  const toggle = useCallback(
    (messageId: string, text: string) => {
      if (activeMessageId === messageId && ttsState === "speaking") {
        stop();
        return;
      }
      speak(messageId, text);
    },
    [activeMessageId, speak, stop, ttsState]
  );

  return {
    ttsState,
    activeMessageId,
    supported: typeof window !== "undefined" && "speechSynthesis" in window,
    speak,
    stop,
    toggle
  };
}
