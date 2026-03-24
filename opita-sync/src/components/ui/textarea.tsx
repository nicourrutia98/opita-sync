import * as React from "react";
import { cn } from "../../lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoGrow?: boolean;
  maxHeight?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, autoGrow = false, maxHeight = 240, onChange, ...props },
  forwardedRef
) {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  const resizeToFit = React.useCallback(() => {
    if (!autoGrow || !textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
  }, [autoGrow, maxHeight]);

  React.useLayoutEffect(() => {
    resizeToFit();
  }, [props.value, props.defaultValue, resizeToFit]);

  return (
    <textarea
      ref={(node) => {
        textareaRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      }}
      className={cn(
        "min-h-24 w-full rounded-[24px] border border-line/80 bg-panel px-5 py-4 text-[15px] leading-7 text-ink shadow-soft outline-none transition-[height,border-color,box-shadow,background-color] duration-200 ease-out ring-offset-2 ring-offset-paper placeholder:text-muted/95 focus-visible:border-brand/45 focus-visible:ring-2 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:border-line/70 disabled:bg-surface/80 disabled:text-muted",
        className
      )}
      onChange={(event) => {
        onChange?.(event);
      }}
      onInput={resizeToFit}
      {...props}
    />
  );
});
