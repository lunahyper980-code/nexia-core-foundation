import * as React from "react";
import { cn } from "@/lib/utils";

interface PremiumFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  variant?: "default" | "subtle" | "glass";
}

const PremiumFrame = React.forwardRef<HTMLDivElement, PremiumFrameProps>(
  ({ className, title, variant = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "premium-frame relative rounded-2xl overflow-hidden",
          variant === "default" && "premium-frame-default",
          variant === "subtle" && "premium-frame-subtle",
          variant === "glass" && "premium-frame-glass",
          className
        )}
        {...props}
      >
        {/* Header bar */}
        {title && (
          <div className="premium-frame-header flex items-center gap-3 px-4 py-3 border-b border-primary/10">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
          </div>
        )}
        
        {/* Content */}
        <div className="premium-frame-content p-5">
          {children}
        </div>
      </div>
    );
  }
);
PremiumFrame.displayName = "PremiumFrame";

export { PremiumFrame };
