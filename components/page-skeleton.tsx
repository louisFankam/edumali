export function PageSkeleton() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:block w-64 border-r border-sidebar-border" />
      <main className="flex-1 p-6">
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-72 bg-muted rounded" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-muted rounded-lg" />
            ))}
          </div>
          <div className="h-48 bg-muted rounded-lg" />
        </div>
      </main>
    </div>
  )
}
