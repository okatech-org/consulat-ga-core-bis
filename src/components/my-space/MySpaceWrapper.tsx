import { cn } from "@/lib/utils"

interface MySpaceWrapperProps {
  children: React.ReactNode
  className?: string
}

export function MySpaceWrapper({ children, className }: MySpaceWrapperProps) {
  return (
    <div 
      className={cn(
        "bg-background-dashboard",
        className
      )}
    >
      {children}
    </div>
  )
}
