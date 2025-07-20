
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        success: "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
        warning: "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200", 
        error: "border-transparent bg-red-100 text-red-800 hover:bg-red-200",
        info: "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200",
        outline: "text-foreground border-border",
        purple: "border-transparent bg-purple-100 text-purple-800 hover:bg-purple-200",
        gold: "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs", 
        lg: "px-3 py-1 text-sm",
      },
      animated: {
        true: "animate-pulse",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      animated: false,
    },
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {
  dot?: boolean
}

function StatusBadge({ className, variant, size, animated, dot = false, children, ...props }: StatusBadgeProps) {
  return (
    <div className={cn(statusBadgeVariants({ variant, size, animated }), className)} {...props}>
      {dot && (
        <div className={cn(
          "w-2 h-2 rounded-full",
          variant === 'success' && "bg-green-500",
          variant === 'warning' && "bg-yellow-500",
          variant === 'error' && "bg-red-500",
          variant === 'info' && "bg-blue-500",
          variant === 'purple' && "bg-purple-500",
          variant === 'gold' && "bg-yellow-500",
          (!variant || variant === 'default') && "bg-primary",
        )} />
      )}
      {children}
    </div>
  )
}

export { StatusBadge, statusBadgeVariants }
