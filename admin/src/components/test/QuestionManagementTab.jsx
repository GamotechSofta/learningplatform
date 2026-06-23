import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import QuestionFilters from "../questions/QuestionFilters";
import QuestionForm, { emptyForm } from "../questions/QuestionForm";
import MathText from "../questions/MathText";
import {
  createQuestion,
  deleteQuestion,
  deleteQuestionsBulk,
  getQuestions,
  importQuestions,
  updateQuestion,
} from "../../services/questionService";

export default function QuestionManagementTab({ onMessage, onError }) {
  const [questions, setQuestions] = useState([]);
  const [filters, setFilters] = useState({
    q: "",
    subject: "",
    shift: "",
    questionNumber: "",
  });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("text");
  const csvInputRef = useRef(null);

  const subjects = useMemo(
    () => [...new Set(questions.map((item) => item.subject).filter(Boolean))],
    [questions]
  );
  const shifts = useMemo(
    () => [...new Set(questions.map((item) => item.shift).filter(Boolean))],
    [questions]
  );

  const loadQuestions = async (nextPage = page) => {
    try {
      setLoading(true);
      const result = await getQuestions({
        ...filters,
        page: nextPage,
        limit: 20,
      });
      setQuestions(result.data);
      setPage(result.page);
      setPages(result.pages);
    } catch (err) {
      onError(err.response?.data?.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions(1);
  }, []);

  const openForm = (mode, question = null) => {
    setFormMode(mode);
    if (question) {
      setEditing(question._id);
      setForm({
        questionNumber: String(question.questionNumber || ""),
        subject: question.subject || "",
        shift: question.shift || "",
        chapter: question.chapter || "",
        question: question.question || "",
        options: question.options?.length ? question.options : ["", "", "", ""],
        correctAnswer: String(question.correctAnswer || "1"),
        explanation: question.explanation || "",
        difficulty: question.difficulty || "medium",
        questionType: question.questionType || "text",
        imageUrl: question.imageUrl || "",
        tags: question.tags || [],
      });
    } else {
      setEditing(null);
      setForm({
        ...emptyForm,
        questionType: mode === "image" ? "image" : mode === "latex" ? "latex" : "text",
      });
    }
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      questionNumber: Number(form.questionNumber),
      options: form.options.filter(Boolean),
      tags: form.tags || [],
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
      loadQuestions(page);
    } catch (err) {
      onError(err.response?.data?.message || "Failed to save question");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await deleteQuestion(id);
      onMessage("Question deleted");
      loadQuestions(page);
    } catch (err) {
      onError(err.response?.data?.message || "Failed to delete question");
    }
  };

  const handleImportDataset = async () => {
    try {
      setImporting(true);
      const result = await importQuestions({ clearExisting: false });
      onMessage(
        `Imported ${result.data.imported}, updated ${result.data.updated}, skipped ${result.data.skipped}`
      );
      loadQuestions(1);
    } catch (err) {
      onError(err.response?.data?.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleCsvUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      const csvText = await file.text();
      const result = await importQuestions({ csvText, clearExisting: false });
      onMessage(
        `CSV: imported ${result.data.imported}, updated ${result.data.updated}, skipped ${result.data.skipped}`
      );
      loadQuestions(1);
    } catch (err) {
      onError(err.response?.data?.message || "CSV import failed");
    } finally {
      setImporting(false);
      if (csvInputRef.current) csvInputRef.current.value = "";
    }
  };

  const handleBulkDelete = async () => {
    if (!filters.subject) {
      onError("Select a subject filter first to bulk delete");
      return;
    }
    if (!window.confirm(`Delete all ${filters.subject} questions?`)) return;
    try {
      await deleteQuestionsBulk({ subject: filters.subject });
      onMessage(`${filters.subject} questions deleted`);
      loadQuestions(1);
    } catch (err) {
      onError(err.response?.data?.message || "Bulk delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Question Actions
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openForm("text")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            Add Question
          </button>
          <button
            type="button"
            onClick={() => openForm("image")}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:text-slate-200"
          >
            Add Image Question
          </button>
          <button
            type="button"
            onClick={() => openForm("latex")}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:text-slate-200"
          >
            Add Formula/LaTeX Question
          </button>
          <button
            type="button"
            onClick={handleImportDataset}
            disabled={importing}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:text-slate-200 disabled:opacity-60"
          >
            {importing ? "Importing..." : "Bulk CSV Import (Dataset)"}
          </button>
          <button
            type="button"
            onClick={() => csvInputRef.current?.click()}
            disabled={importing}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:text-slate-200 disabled:opacity-60"
          >
            Upload CSV File
          </button>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleCsvUpload}
          />
          <button
            type="button"
            onClick={handleBulkDelete}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600"
          >
            Delete by Subject Filter
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Edit, delete, assign subject/chapter, set difficulty, add tags, explanation & solution.
        </p>
      </div>

      <QuestionFilters
        filters={filters}
        subjects={subjects}
        shifts={shifts}
        onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
        onSubmit={(e) => {
          e.preventDefault();
          loadQuestions(1);
        }}
      />

      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            {editing ? "Edit Question" : formMode === "image" ? "Add Image Question" : formMode === "latex" ? "Add Formula/LaTeX Question" : "Add Question"}
          </h2>
          <QuestionForm
            form={form}
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

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        {loading ? (
          <p className="p-4 text-sm text-slate-500">Loading questions...</p>
        ) : questions.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">No questions found.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {questions.map((question) => (
              <div
                key={question._id}
                className="grid gap-3 p-4 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>#{question.questionNumber}</span>
                    <span>{question.subject}</span>
                    {question.chapter && <span>{question.chapter}</span>}
                    <span>{question.shift}</span>
                    <span className="capitalize">{question.difficulty}</span>
                    <span className="capitalize">{question.questionType || "text"}</span>
                    {question.tags?.map((tag) => (
                      <span key={tag} className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                  {question.imageUrl && (
                    <img
                      src={question.imageUrl}
                      alt="Question"
                      className="mt-2 max-h-32 rounded-lg border border-slate-200 object-contain dark:border-slate-700"
                    />
                  )}
                  <MathText className="mt-2 line-clamp-3 text-sm">
                    {question.question}
                  </MathText>
                </div>
                <div className="flex items-start gap-2">
                  <Link
                    to={`/questions/${question._id}`}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:text-slate-200"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => openForm(question.questionType || "text", question)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:text-slate-200"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(question._id)}
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

      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => loadQuestions(page - 1)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50"
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
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
