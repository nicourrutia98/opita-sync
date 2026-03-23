import * as React from "react";
import { cn } from "../../lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-3xl border border-line bg-panel px-4 py-3 text-sm text-ink shadow-soft outline-none ring-offset-2 ring-offset-paper placeholder:text-muted focus-visible:ring-2 focus-visible:ring-brand",
        className
      )}
      {...props}
    />
  );
}
