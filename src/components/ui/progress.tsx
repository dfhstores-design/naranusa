import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
}

export const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(({ className, indicatorClassName, value = 0, ...props }, ref) => {
  const safeValue = Math.max(0, Math.min(100, value ?? 0));
  return (
    <ProgressPrimitive.Root ref={ref} value={safeValue} className={cn("relative h-2 w-full overflow-hidden rounded-full bg-[#eeecf8]", className)} {...props}>
      <ProgressPrimitive.Indicator className={cn("h-full w-full flex-1 bg-[#8c7be7] transition-transform", indicatorClassName)} style={{ transform: `translateX(-${100 - safeValue}%)` }} />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;
