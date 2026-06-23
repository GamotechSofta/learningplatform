export default function CourseSelectBar({
  courses,
  loading,
  selectedCourseId,
  onChange,
  hint = "प्रथम Course निवडा, मगच Single Question किंवा Bulk CSV Upload करा.",
}) {
  const selectedCourse = courses.find((c) => c._id === selectedCourseId);

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-semibold text-blue-900 dark:text-blue-100">
            Select Course *
          </label>
          <p className="mb-2 text-xs text-blue-700 dark:text-blue-300">{hint}</p>
          <select
            value={selectedCourseId}
            onChange={(e) => onChange(e.target.value)}
            disabled={loading}
            className="w-full max-w-xl rounded-lg border border-blue-300 bg-white px-3 py-2.5 text-sm dark:border-blue-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">— Course निवडा —</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
        {selectedCourse && (
          <div className="rounded-lg bg-white px-4 py-2 text-sm dark:bg-slate-800">
            <span className="text-slate-500">Selected:</span>{" "}
            <span className="font-medium text-slate-900 dark:text-white">
              {selectedCourse.title}
            </span>
          </div>
        )}
      </div>
      {!selectedCourseId && (
        <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
          Course निवडल्याशिवाय Add Question किंवा CSV Upload करता येणार नाही.
        </p>
      )}
    </div>
  );
}
