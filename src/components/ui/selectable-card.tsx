import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface SelectableCardProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  preview?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  showCheckmark?: boolean;
}

const SelectableCard = React.forwardRef<HTMLDivElement, SelectableCardProps>(
  ({ className, selected, icon: Icon, title, subtitle, preview, size = "md", showCheckmark = true, onClick, ...props }, ref) => {
    const sizeClasses = {
      sm: "p-3 gap-2",
      md: "p-4 gap-3",
      lg: "p-5 gap-4"
    };

    const iconSizes = {
      sm: "h-5 w-5",
      md: "h-6 w-6",
      lg: "h-8 w-8"
    };

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          "relative flex flex-col items-center text-center rounded-xl cursor-pointer transition-all duration-300",
          "bg-[hsl(228,12%,10%)] border border-border/50",
          "hover:border-primary/40 hover:shadow-[0_0_20px_hsl(268,60%,50%/0.15)]",
          "active:scale-[0.98]",
          selected && [
            "border-primary/60",
            "shadow-[0_0_24px_hsl(268,60%,50%/0.2),_inset_0_1px_0_hsl(268,60%,50%/0.1)]",
            "bg-[hsl(228,12%,12%)]"
          ],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {/* Selected Checkmark */}
        {selected && showCheckmark && (
          <div className="absolute top-2 right-2 p-1 rounded-full bg-primary">
            <Check className="h-3 w-3 text-primary-foreground" />
          </div>
        )}

        {/* Preview or Icon */}
        {preview ? (
          <div className="flex items-center justify-center">
            {preview}
          </div>
        ) : Icon ? (
          <div className={cn(
            "p-2.5 rounded-xl transition-colors",
            selected ? "bg-primary/20" : "bg-primary/10"
          )}>
            <Icon className={cn(iconSizes[size], "text-primary")} />
          </div>
        ) : null}

        {/* Text */}
        <div className="space-y-0.5">
          <p className={cn(
            "font-medium text-foreground transition-colors",
            size === "sm" && "text-sm",
            size === "md" && "text-sm",
            size === "lg" && "text-base",
            selected && "text-primary"
          )}>
            {title}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    );
  }
);
SelectableCard.displayName = "SelectableCard";

interface ColorCardProps extends React.HTMLAttributes<HTMLDivElement> {
  color: string;
  label: string;
  onColorChange: (color: string) => void;
}

const ColorCard = React.forwardRef<HTMLDivElement, ColorCardProps>(
  ({ className, color, label, onColorChange, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex flex-col items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-300",
          "bg-[hsl(228,12%,10%)] border border-border/50",
          "hover:border-primary/40 hover:shadow-[0_0_20px_hsl(268,60%,50%/0.15)]",
          className
        )}
        {...props}
      >
        <label className="cursor-pointer">
          <input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div
            className="w-12 h-12 rounded-xl border-2 border-border/50 shadow-md transition-transform hover:scale-105"
            style={{ backgroundColor: color }}
          />
        </label>
        <div className="space-y-1 text-center">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs font-mono text-muted-foreground uppercase">{color}</p>
        </div>
      </div>
    );
  }
);
ColorCard.displayName = "ColorCard";

export { SelectableCard, ColorCard };
