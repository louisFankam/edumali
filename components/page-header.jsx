import { cn } from "@/lib/utils"

export function PageHeader({ title, description, children, className }) {
  return (
    <div
      className={cn("flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0", className)}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex items-center space-x-2">{children}</div>}
    </div>
  )
}
