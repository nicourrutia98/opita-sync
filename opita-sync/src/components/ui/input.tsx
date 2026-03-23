import * as React from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border border-line bg-panel px-4 text-sm text-ink shadow-soft outline-none ring-offset-2 ring-offset-paper placeholder:text-muted focus-visible:ring-2 focus-visible:ring-brand",
        className
      )}
      {...props}
    />
  );
}
