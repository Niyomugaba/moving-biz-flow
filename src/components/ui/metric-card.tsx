
import * as React from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
    period?: string
  }
  icon?: React.ComponentType<{ className?: string }>
  variant?: 'default' | 'success' | 'warning' | 'error' | 'purple' | 'gold'
  size?: 'sm' | 'md' | 'lg'
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ 
    className, 
    title, 
    value, 
    change, 
    icon: Icon, 
    variant = 'default', 
    size = 'md',
    ...props 
  }, ref) => {
    const variants = {
      default: "bg-card border-border",
      success: "bg-green-50 border-green-200",
      warning: "bg-yellow-50 border-yellow-200", 
      error: "bg-red-50 border-red-200",
      purple: "bg-purple-50 border-purple-200",
      gold: "bg-yellow-50 border-yellow-200"
    }

    const iconColors = {
      default: "text-primary",
      success: "text-green-600",
      warning: "text-yellow-600",
      error: "text-red-600", 
      purple: "text-purple-600",
      gold: "text-yellow-600"
    }

    const sizes = {
      sm: {
        container: "p-4",
        title: "text-sm",
        value: "text-xl",
        icon: "h-4 w-4"
      },
      md: {
        container: "p-6",
        title: "text-sm", 
        value: "text-2xl",
        icon: "h-5 w-5"
      },
      lg: {
        container: "p-8",
        title: "text-base",
        value: "text-3xl", 
        icon: "h-6 w-6"
      }
    }

    const getTrendIcon = () => {
      if (!change) return null
      
      switch (change.type) {
        case 'increase':
          return <TrendingUp className="h-4 w-4 text-green-600" />
        case 'decrease':
          return <TrendingDown className="h-4 w-4 text-red-600" />
        case 'neutral':
          return <Minus className="h-4 w-4 text-gray-500" />
        default:
          return null
      }
    }

    const getTrendColor = () => {
      if (!change) return ""
      
      switch (change.type) {
        case 'increase':
          return "text-green-600"
        case 'decrease':
          return "text-red-600"
        case 'neutral':
          return "text-gray-500"
        default:
          return ""
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border shadow-sm transition-smooth hover:shadow-md",
          variants[variant],
          sizes[size].container,
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={cn(
              "font-medium text-muted-foreground",
              sizes[size].title
            )}>
              {title}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className={cn(
                "font-bold text-foreground",
                sizes[size].value
              )}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {change && (
                <div className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  getTrendColor()
                )}>
                  {getTrendIcon()}
                  <span>
                    {Math.abs(change.value)}%
                    {change.period && ` ${change.period}`}
                  </span>
                </div>
              )}
            </div>
          </div>
          {Icon && (
            <div className={cn(
              "rounded-full p-2",
              variant === 'default' ? "bg-primary/10" : "bg-white/50"
            )}>
              <Icon className={cn(
                iconColors[variant],
                sizes[size].icon
              )} />
            </div>
          )}
        </div>
      </div>
    )
  }
)
MetricCard.displayName = "MetricCard"

export { MetricCard }
