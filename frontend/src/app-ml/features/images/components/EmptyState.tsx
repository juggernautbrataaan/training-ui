"use client"

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}

