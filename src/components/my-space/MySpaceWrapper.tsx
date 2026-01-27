import { cn } from "@/lib/utils"

interface MySpaceWrapperProps {
  children: React.ReactNode
  className?: string
}

export function MySpaceWrapper({ children, className }: MySpaceWrapperProps) {
  return (
    <div 
      className={cn(
        "min-h-screen w-full",
        className
      )}
      style={{ backgroundColor: "#EAE9E2" }}
    >
      {children}
    </div>
  )
}
