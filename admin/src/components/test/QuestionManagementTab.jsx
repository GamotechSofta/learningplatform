import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CsvImportPanel from "../questions/CsvImportPanel";
import CourseSelectBar from "../questions/CourseSelectBar";
import QuestionForm, { emptyForm } from "../questions/QuestionForm";
import MathText from "../questions/MathText";
import {
  bulkSoftDelete,
  bulkUpdateQuestions,
  cloneQuestion,
  deleteQuestion,
  downloadBlob,
  exportQuestions,
  getDuplicateQuestions,
  getQuestionVersions,
  getQuestions,
  createQuestion,
  updateQuestion,
} from "../../services/questionService";
import { getCourses } from "../../services/courseService";

const SECTIONS = [
  { id: "list", label: "Question List" },
  { id: "import", label: "Bulk CSV" },
];

export default function QuestionManagementTab({ onMessage, onError }) {
  const [section, setSection] = useState("list");
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const [versions, setVersions] = useState([]);
  const [bulkDifficulty, setBulkDifficulty] = useState("medium");

  const selectedCourse = useMemo(
    () => courses.find((c) => c._id === selectedCourseId),
    [courses, selectedCourseId]
  );

  const courseParams = selectedCourseId ? { course: selectedCourseId } : {};

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

  const loadQuestions = async (nextPage = page, extra = {}) => {
    if (!selectedCourseId) {
      setQuestions([]);
      setPages(1);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const result = await getQuestions({
        ...courseParams,
        sort: "latest",
        page: nextPage,
        limit: 20,
        ...extra,
      });
      setQuestions(result.data);
      setPage(result.page);
      setPages(result.pages);
      setSelected([]);
    } catch (err) {
      onError(err.response?.data?.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const loadDuplicates = async () => {
    if (!selectedCourseId) {
      setDuplicates([]);
      return;
    }
    try {
      const data = await getDuplicateQuestions(selectedCourseId);
      setDuplicates(data);
    } catch {
      setDuplicates([]);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;
    loadQuestions(1);
    loadDuplicates();
  }, [selectedCourseId]);

  const openForm = (question = null) => {
    if (question) {
      setEditing(question._id);
      setForm({
        questionNumber: String(question.questionNumber || ""),
        subject: question.subject || "",
        shift: question.shift || "",
        year: String(question.year || ""),
        chapter: question.chapter || "",
        course: question.course?._id || question.course || selectedCourseId || "",
        question: question.question || "",
        options: question.options?.length ? question.options : ["", "", "", ""],
        correctAnswer: String(question.correctAnswer || "1"),
        explanation: question.explanation || "",
        difficulty: question.difficulty || "medium",
        questionType: question.questionType || "rich",
        image: question.image || question.imageUrl || "",
        tags: question.tags || [],
        status: question.status || "active",
      });
    } else {
      setEditing(null);
      setForm({
        ...emptyForm,
        course: selectedCourseId || "",
      });
    }
    setShowForm(true);
    setSection("list");
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      questionNumber: form.questionNumber ? Number(form.questionNumber) : undefined,
      year: form.year ? Number(form.year) : undefined,
      options: form.options.filter(Boolean),
      correctAnswer: Number(form.correctAnswer),
      image: form.image || form.imageUrl || "",
      course: form.course || selectedCourseId || undefined,
    };

    try {
      if (editing) {
        await updateQuestion(editing, payload);
        onMessage("Question updated");
      } else {
        await createQuestion(payload);
        onMessage("Question created");
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      setSection("list");
      loadQuestions(page);
      loadDuplicates();
    } catch (err) {
      onError(err.response?.data?.message || "Failed to save question");
    }
  };

  const handleSoftDelete = async (id) => {
    if (!window.confirm("Move this question to trash?")) return;
    try {
      await deleteQuestion(id);
      onMessage("Question moved to trash");
      loadQuestions(page);
    } catch (err) {
      onError(err.response?.data?.message || "Delete failed");
    }
  };

  const handleClone = async (id) => {
    try {
      await cloneQuestion(id);
      onMessage("Question cloned");
      loadQuestions(page);
    } catch (err) {
      onError(err.response?.data?.message || "Clone failed");
    }
  };

  const handleVersions = async (id) => {
    try {
      const data = await getQuestionVersions(id);
      setVersions(data);
    } catch (err) {
      onError(err.response?.data?.message || "Failed to load versions");
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === questions.length) {
      setSelected([]);
    } else {
      setSelected(questions.map((q) => q._id));
    }
  };

  const handleBulkDelete = async () => {
    if (!selected.length) return;
    if (!window.confirm(`Delete ${selected.length} selected question(s)?`)) return;
    try {
      await bulkSoftDelete(selected);
      onMessage(`${selected.length} question(s) moved to trash`);
      loadQuestions(page);
    } catch (err) {
      onError(err.response?.data?.message || "Bulk delete failed");
    }
  };

  const handleBulkEdit = async () => {
    if (!selected.length) return;
    try {
      await bulkUpdateQuestions(selected, { difficulty: bulkDifficulty });
      onMessage(`${selected.length} question(s) updated`);
      loadQuestions(page);
    } catch (err) {
      onError(err.response?.data?.message || "Bulk edit failed");
    }
  };

  const handleExport = async (format) => {
    if (!selectedCourseId) {
      onError("Please select a course first");
      return;
    }
    try {
      if (format === "csv") {
        const blob = await exportQuestions({ ...courseParams, sort: "latest" }, "csv");
        downloadBlob(blob, "questions.csv");
      } else {
        const result = await exportQuestions({ ...courseParams, sort: "latest" }, "json");
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: "application/json",
        });
        downloadBlob(blob, "questions.json");
      }
      onMessage(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      onError(err.response?.data?.message || "Export failed");
    }
  };

  const requireCourse = () => {
    if (!selectedCourseId) {
      onError("Please select a course first");
      return false;
    }
    return true;
  };

  return (
    <div className="space-y-6">
      <CourseSelectBar
        courses={courses}
        loading={coursesLoading}
        selectedCourseId={selectedCourseId}
        onChange={setSelectedCourseId}
        hint="Course निवडा (list filter). CSV मध्ये Course column किंवा form मध्ये course optional."
      />

      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              if (item.id === "import") {
                setSection(item.id);
                return;
              }
              if (!requireCourse()) return;
              setSection(item.id);
              if (item.id === "list") loadQuestions(1);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              section === item.id
                ? "bg-blue-600 text-white"
                : "border border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {section === "import" && (
        <CsvImportPanel
          courseId={selectedCourseId || null}
          courseName={selectedCourse?.title}
          onComplete={() => {
            onMessage("CSV import completed");
            loadQuestions(1);
            loadDuplicates();
          }}
          onError={onError}
        />
      )}

      {section === "list" && !selectedCourseId && (
        <div className="space-y-3">
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            प्रश्न list पाहण्यासाठी Course निवडा. Add Question / CSV import course optional.
          </p>
          <button
            type="button"
            onClick={() => openForm()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            Add Question
          </button>
        </div>
      )}

      {section === "list" && showForm && !selectedCourseId && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold">
            {editing ? "Edit Question" : "Add Question"}
          </h2>
          <QuestionForm
            form={form}
            courses={courses}
            onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
            onSubmit={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
            submitLabel={editing ? "Update Question" : "Create Question"}
          />
        </div>
      )}

      {section === "list" && selectedCourseId && (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openForm()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            >
              Add Question
            </button>
                <button
                  type="button"
                  onClick={() => handleExport("csv")}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:text-slate-200"
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("json")}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:text-slate-200"
                >
                  Export JSON
                </button>
            {selected.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600"
                >
                  Delete Selected ({selected.length})
                </button>
                <select
                  value={bulkDifficulty}
                  onChange={(e) => setBulkDifficulty(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <button
                  type="button"
                  onClick={handleBulkEdit}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
                >
                  Bulk Edit Difficulty
                </button>
              </>
            )}
          </div>

          {showForm && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
              <h2 className="mb-1 text-lg font-semibold">
                {editing ? "Edit Question" : "Add Question"}
              </h2>
              <p className="mb-4 text-sm text-blue-700 dark:text-blue-300">
                Course: {selectedCourse?.title}
              </p>
              <QuestionForm
                form={form}
                courses={courses}
                onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
                onSubmit={handleSave}
                onCancel={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                submitLabel={editing ? "Update Question" : "Create Question"}
              />
            </div>
          )}

          {duplicates.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
              {duplicates.length} duplicate group(s) detected in database.
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-2 dark:border-slate-800">
              <input
                type="checkbox"
                checked={selected.length === questions.length && questions.length > 0}
                onChange={toggleSelectAll}
              />
              <span className="text-xs text-slate-500">Select all on page</span>
            </div>
            {loading ? (
              <p className="p-4 text-sm text-slate-500">Loading questions...</p>
            ) : questions.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">No questions found.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {questions.map((question) => (
                  <div
                    key={question._id}
                    className="grid gap-3 p-4 md:grid-cols-[auto_1fr_auto]"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(question._id)}
                      onChange={() => toggleSelect(question._id)}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                        {question.questionNumber && <span>#{question.questionNumber}</span>}
                        <span>{question.subject}</span>
                        {question.chapter && <span>{question.chapter}</span>}
                        {question.year && <span>{question.year}</span>}
                        <span className="capitalize">{question.difficulty}</span>
                        {question.tags?.map((tag) => (
                          <span key={tag} className="rounded bg-slate-100 px-1.5 dark:bg-slate-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                      {(question.image || question.imageUrl) && (
                        <img
                          src={question.image || question.imageUrl}
                          alt="Question"
                          className="mt-2 max-h-24 rounded border object-contain"
                        />
                      )}
                      <MathText className="mt-2 line-clamp-3 text-sm">
                        {question.question}
                      </MathText>
                    </div>
                    <div className="flex flex-wrap items-start gap-2">
                      <Link
                        to={`/questions/${question._id}`}
                        className="rounded-lg border px-3 py-1.5 text-sm"
                      >
                        View
                      </Link>
                      <button type="button" onClick={() => openForm(question)} className="rounded-lg border px-3 py-1.5 text-sm">
                        Edit
                      </button>
                      <button type="button" onClick={() => handleClone(question._id)} className="rounded-lg border px-3 py-1.5 text-sm">
                        Clone
                      </button>
                      <button type="button" onClick={() => handleVersions(question._id)} className="rounded-lg border px-3 py-1.5 text-sm">
                        History
                      </button>
                      <button type="button" onClick={() => handleSoftDelete(question._id)} className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => loadQuestions(page - 1)}
              className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500">
              Page {page} of {pages}
            </span>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => loadQuestions(page + 1)}
              className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>

          {versions.length > 0 && (
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="font-medium">Version History</h4>
                <button type="button" onClick={() => setVersions([])} className="text-sm text-slate-500">
                  Close
                </button>
              </div>
              <div className="max-h-48 space-y-2 overflow-y-auto text-sm">
                {versions.map((v) => (
                  <div key={v._id} className="rounded bg-slate-50 px-3 py-2 dark:bg-slate-800">
                    v{v.version} — {new Date(v.createdAt).toLocaleString()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
