export default function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface animate-pulse">
      <div className="aspect-video bg-border-light" />
      <div className="flex items-center justify-between px-4 py-3">
        <div className="h-4 w-2/3 rounded bg-border-light" />
        <div className="h-6 w-10 rounded-full bg-border-light" />
      </div>
    </div>
  )
}
