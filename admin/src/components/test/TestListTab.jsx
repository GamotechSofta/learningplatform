import { useEffect, useMemo, useState } from "react";
import CourseSelectBar from "../questions/CourseSelectBar";
import TestSettingsForm from "./TestSettingsForm";
import {
  cloneTest,
  createTest,
  deleteTest,
  emptyTestForm,
  formToPayload,
  getTestById,
  getTests,
  publishTest,
  scheduleTest,
  testToForm,
  unpublishTest,
  updateTest,
} from "../../services/testService";
import { getQuestions } from "../../services/questionService";
import { getCourses } from "../../services/courseService";

const statusColors = {
  draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  scheduled: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  published: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  unpublished: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export default function TestListTab({ onMessage, onError }) {
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduleId, setScheduleId] = useState(null);
  const [scheduleDates, setScheduleDates] = useState({ startDate: "", endDate: "" });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyTestForm);
  const [formLoading, setFormLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [availableQuestionCount, setAvailableQuestionCount] = useState(0);

  const selectedCourse = useMemo(
    () => courses.find((c) => c._id === selectedCourseId),
    [courses, selectedCourseId]
  );

  const loadCourses = async () => {
    try {
      setCoursesLoading(true);
      const result = await getCourses({ limit: 200 });
      setCourses(result.data || []);
    } catch (err) {
      onError(err.response?.data?.message || "Failed to load courses");
    } finally {
      setCoursesLoading(false);
    }
  };

  const loadTests = async () => {
    if (!selectedCourseId) {
      setTests([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const result = await getTests({ course: selectedCourseId, limit: 50 });
      setTests(result.data);
    } catch (err) {
      onError(err.response?.data?.message || "Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableQuestions = async () => {
    if (!selectedCourseId) {
      setAvailableQuestionCount(0);
      return;
    }
    try {
      const result = await getQuestions({ course: selectedCourseId, limit: 1 });
      setAvailableQuestionCount(result.total || 0);
    } catch {
      setAvailableQuestionCount(0);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    loadTests();
    loadAvailableQuestions();
  }, [selectedCourseId]);

  const openCreateForm = () => {
    if (!selectedCourseId) {
      onError("Please select a course first");
      return;
    }
    if (availableQuestionCount < 1) {
      onError("No questions in this course. Add questions in Question Management first.");
      return;
    }
    setEditingId(null);
    setForm({
      ...emptyTestForm,
      questionCount: Math.min(10, availableQuestionCount),
    });
    setShowForm(true);
  };

  const openEditForm = async (id) => {
    try {
      setFormLoading(true);
      setShowForm(true);
      setEditingId(id);
      const test = await getTestById(id);
      setForm(testToForm(test));
    } catch (err) {
      onError(err.response?.data?.message || "Failed to load test");
      setShowForm(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) {
      onError("Please select a course first");
      return;
    }
    try {
      setSaving(true);
      const payload = formToPayload(form, selectedCourseId);
      if (editingId) {
        await updateTest(editingId, payload);
        onMessage("Test updated");
      } else {
        await createTest(payload);
        onMessage("Test created");
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyTestForm);
      loadTests();
    } catch (err) {
      onError(err.response?.data?.message || "Failed to save test");
    } finally {
      setSaving(false);
    }
  };

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
      if (editingId === id) {
        setShowForm(false);
        setEditingId(null);
      }
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
      <CourseSelectBar
        courses={courses}
        loading={coursesLoading}
        selectedCourseId={selectedCourseId}
        onChange={setSelectedCourseId}
        hint="प्रथम Course निवडा, मगच Test Create किंवा Edit करा."
      />

      {!selectedCourseId && (
        <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          Test तयार करण्यासाठी वर Course निवडा.
        </p>
      )}

      {selectedCourseId && (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={openCreateForm}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            >
              Create Test
            </button>
          </div>

          {showForm && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
              <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">
                {editingId ? "Edit Test" : "Create Test"}
              </h2>
              <p className="mb-4 text-sm text-blue-700 dark:text-blue-300">
                Course: {selectedCourse?.title}
              </p>
              {formLoading ? (
                <p className="text-sm text-slate-500">Loading test...</p>
              ) : (
                <TestSettingsForm
                  form={form}
                  onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
                  onSubmit={handleSave}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm(emptyTestForm);
                  }}
                  submitLabel={saving ? "Saving..." : editingId ? "Update Test" : "Create Test"}
                  availableQuestionCount={availableQuestionCount}
                />
              )}
            </div>
          )}

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
                <button type="submit" className="rounded-lg bg-amber-600 px-4 py-2 text-sm text-white">
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
                  <div key={test._id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white">{test.name}</h3>
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
                        {test.durationMinutes} min · {test.totalMarks} marks ·{" "}
                        {test.questionCount || test.assignedCount || 0} questions
                      </p>
                    </div>
                    <div className="flex flex-wrap items-start gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(test._id)}
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
        </>
      )}
    </div>
  );
}
