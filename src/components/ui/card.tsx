import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "premium" | "metric" | "glass";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, variant = "default", ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "rounded-xl text-card-foreground",
      variant === "default" && [
        "bg-card",
        "border border-primary/10",
        "shadow-sm",
        "card-shimmer"
      ],
      variant === "premium" && [
        "premium-frame-default",
        "border border-primary/15",
        "shadow-lg",
        "card-hover-glow"
      ],
      variant === "metric" && [
        "metric-card-premium",
        "p-0",
        "card-hover"
      ],
      variant === "glass" && [
        "bg-card/75 backdrop-blur-2xl",
        "border border-white/[0.08]",
        "shadow-lg shadow-black/30",
        "card-pulse-border"
      ],
      className
    )} 
    {...props} 
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        "flex flex-col space-y-1.5 p-6",
        className
      )} 
      {...props} 
    />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-base font-semibold leading-tight tracking-tight text-foreground", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn(
        "flex items-center p-6 pt-4",
        "border-t border-primary/5",
        className
      )} 
      {...props} 
    />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
