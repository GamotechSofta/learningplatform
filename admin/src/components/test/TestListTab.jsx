import { useEffect, useState } from "react";
import {
  cloneTest,
  deleteTest,
  getTests,
  publishTest,
  scheduleTest,
  unpublishTest,
} from "../../services/testService";

const statusColors = {
  draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  scheduled: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  published: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  unpublished: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export default function TestListTab({
  selectedTestId,
  onSelectTest,
  onCreateTest,
  onEditSettings,
  onMessage,
  onError,
}) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [scheduleId, setScheduleId] = useState(null);
  const [scheduleDates, setScheduleDates] = useState({ startDate: "", endDate: "" });

  const loadTests = async () => {
    try {
      setLoading(true);
      const result = await getTests({ q: search, limit: 50 });
      setTests(result.data);
    } catch (err) {
      onError(err.response?.data?.message || "Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  const handleClone = async (id) => {
    try {
      const clone = await cloneTest(id);
      onMessage(`Test cloned: ${clone.name}`);
      loadTests();
    } catch (err) {
      onError(err.response?.data?.message || "Clone failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this test?")) return;
    try {
      await deleteTest(id);
      onMessage("Test deleted");
      if (selectedTestId === id) onSelectTest(null);
      loadTests();
    } catch (err) {
      onError(err.response?.data?.message || "Delete failed");
    }
  };

  const handlePublish = async (id) => {
    try {
      await publishTest(id);
      onMessage("Test published");
      loadTests();
    } catch (err) {
      onError(err.response?.data?.message || "Publish failed");
    }
  };

  const handleUnpublish = async (id) => {
    try {
      await unpublishTest(id);
      onMessage("Test unpublished");
      loadTests();
    } catch (err) {
      onError(err.response?.data?.message || "Unpublish failed");
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleId) return;
    try {
      await scheduleTest(scheduleId, scheduleDates);
      onMessage("Test scheduled");
      setScheduleId(null);
      setScheduleDates({ startDate: "", endDate: "" });
      loadTests();
    } catch (err) {
      onError(err.response?.data?.message || "Schedule failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 gap-2">
          <input
            placeholder="Search tests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <button
            type="button"
            onClick={loadTests}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:text-slate-200"
          >
            Search
          </button>
        </div>
        <button
          type="button"
          onClick={onCreateTest}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
          Create Test
        </button>
      </div>

      {scheduleId && (
        <form
          onSubmit={handleSchedule}
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30"
        >
          <h3 className="mb-3 font-medium text-amber-900 dark:text-amber-100">
            Schedule Test
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              type="datetime-local"
              value={scheduleDates.startDate}
              onChange={(e) =>
                setScheduleDates((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              required
              type="datetime-local"
              value={scheduleDates.endDate}
              onChange={(e) =>
                setScheduleDates((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm text-white"
            >
              Save Schedule
            </button>
            <button
              type="button"
              onClick={() => setScheduleId(null)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        {loading ? (
          <p className="p-4 text-sm text-slate-500">Loading tests...</p>
        ) : tests.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">
            No tests yet. Click Create Test to get started.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {tests.map((test) => (
              <div
                key={test._id}
                className={`grid gap-3 p-4 md:grid-cols-[1fr_auto] ${
                  selectedTestId === test._id ? "bg-blue-50/60 dark:bg-blue-950/20" : ""
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {test.name}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs capitalize ${statusColors[test.status] || statusColors.draft}`}
                    >
                      {test.status}
                    </span>
                    {test.isPaid && (
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-900/40 dark:text-purple-200">
                        Paid ₹{test.price}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {test.subject || "All subjects"}
                    {test.chapter ? ` · ${test.chapter}` : ""}
                    {" · "}
                    {test.durationMinutes} min · {test.totalMarks} marks ·{" "}
                    {test.questionCount || 0} questions
                  </p>
                </div>
                <div className="flex flex-wrap items-start gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectTest(test._id)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:text-slate-200"
                  >
                    Select
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditSettings(test._id)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:text-slate-200"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClone(test._id)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:text-slate-200"
                  >
                    Clone
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleId(test._id)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:text-slate-200"
                  >
                    Schedule
                  </button>
                  {test.status === "published" ? (
                    <button
                      type="button"
                      onClick={() => handleUnpublish(test._id)}
                      className="rounded-lg border border-amber-300 px-3 py-1.5 text-sm text-amber-700"
                    >
                      Unpublish
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePublish(test._id)}
                      className="rounded-lg border border-green-300 px-3 py-1.5 text-sm text-green-700"
                    >
                      Publish
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(test._id)}
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
