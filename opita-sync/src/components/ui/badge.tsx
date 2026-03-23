import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", {
  variants: {
    tone: {
      neutral: "bg-surface text-subtle",
      brand: "bg-brand-soft text-brand-strong",
      success: "bg-success/15 text-[rgb(6_95_70)]",
      warning: "bg-warning/15 text-[rgb(120_53_15)]",
      danger: "bg-danger/15 text-[rgb(127_29_29)]"
    }
  },
  defaultVariants: {
    tone: "neutral"
  }
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ tone }), className)} {...props} />;
}
