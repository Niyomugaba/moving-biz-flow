
import * as React from "react"
import { cn } from "@/lib/utils"

interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'shimmer' | 'pulse'
  lines?: number
  height?: 'sm' | 'md' | 'lg' | 'xl'
}

const LoadingSkeleton = React.forwardRef<HTMLDivElement, LoadingSkeletonProps>(
  ({ className, variant = 'default', lines = 1, height = 'md', ...props }, ref) => {
    const heights = {
      sm: 'h-3',
      md: 'h-4', 
      lg: 'h-6',
      xl: 'h-8'
    }

    const variants = {
      default: 'animate-pulse rounded-md bg-muted',
      shimmer: 'shimmer rounded-md bg-muted',
      pulse: 'animate-pulse rounded-md bg-gradient-to-r from-muted via-muted/50 to-muted'
    }

    if (lines === 1) {
      return (
        <div
          ref={ref}
          className={cn(variants[variant], heights[height], className)}
          {...props}
        />
      )
    }

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              variants[variant],
              heights[height],
              i === lines - 1 && "w-3/4" // Last line is shorter
            )}
          />
        ))}
      </div>
    )
  }
)
LoadingSkeleton.displayName = "LoadingSkeleton"

const LoadingCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card p-6 shadow-sm",
      className
    )}
    {...props}
  >
    <div className="space-y-4">
      <LoadingSkeleton height="lg" />
      <LoadingSkeleton lines={3} />
      <div className="flex gap-2">
        <LoadingSkeleton className="w-20 h-8" />
        <LoadingSkeleton className="w-16 h-8" />
      </div>
    </div>
  </div>
))
LoadingCard.displayName = "LoadingCard"

const LoadingTable = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { rows?: number; cols?: number }
>(({ className, rows = 5, cols = 4, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-4", className)}
    {...props}
  >
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols }).map((_, i) => (
        <LoadingSkeleton key={i} height="sm" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, colIndex) => (
          <LoadingSkeleton key={colIndex} height="md" variant="shimmer" />
        ))}
      </div>
    ))}
  </div>
))
LoadingTable.displayName = "LoadingTable"

export { LoadingSkeleton, LoadingCard, LoadingTable }
