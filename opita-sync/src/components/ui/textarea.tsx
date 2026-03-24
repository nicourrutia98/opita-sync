import * as React from "react";
import { cn } from "../../lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoGrow?: boolean;
  maxHeight?: number;
}

export function Textarea({ className, autoGrow = false, maxHeight = 240, onChange, ...props }: TextareaProps) {
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
      ref={textareaRef}
      className={cn(
        "min-h-28 w-full rounded-3xl border border-line bg-panel px-4 py-3 text-sm text-ink shadow-soft outline-none ring-offset-2 ring-offset-paper placeholder:text-muted focus-visible:ring-2 focus-visible:ring-brand",
        className
      )}
      onChange={(event) => {
        resizeToFit();
        onChange?.(event);
      }}
      {...props}
    />
  );
}
