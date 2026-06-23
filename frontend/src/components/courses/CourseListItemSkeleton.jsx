export default function CourseListItemSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3 border-b border-border px-3 py-3 sm:gap-4 sm:px-4 sm:py-3.5">
      <div className="h-16 w-24 shrink-0 rounded-lg bg-border-light sm:h-[4.25rem] sm:w-28" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-20 rounded bg-border-light" />
        <div className="h-4 w-3/4 rounded bg-border-light" />
        <div className="h-3 w-1/3 rounded bg-border-light" />
        <div className="h-3 w-1/2 rounded bg-border-light" />
      </div>
      <div className="hidden h-10 w-14 shrink-0 space-y-1.5 sm:block">
        <div className="ml-auto h-4 w-10 rounded bg-border-light" />
        <div className="ml-auto h-3 w-12 rounded bg-border-light" />
      </div>
    </div>
  )
}
