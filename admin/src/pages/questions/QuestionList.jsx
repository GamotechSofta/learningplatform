import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../../components/PageShell";
import QuestionFilters from "../../components/questions/QuestionFilters";
import QuestionForm, { emptyForm } from "../../components/questions/QuestionForm";
import MathText from "../../components/questions/MathText";
import {
  createQuestion,
  deleteQuestion,
  getQuestions,
  updateQuestion,
} from "../../services/questionService";

export default function QuestionList() {
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
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

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
      setError(err.response?.data?.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions(1);
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadQuestions(1);
  };

  const startEdit = (question) => {
    setEditing(question._id);
    setForm({
      questionNumber: String(question.questionNumber || ""),
      subject: question.subject || "",
      shift: question.shift || "",
      question: question.question || "",
      options: question.options?.length ? question.options : ["", "", "", ""],
      correctAnswer: String(question.correctAnswer || "1"),
      explanation: question.explanation || "",
      difficulty: question.difficulty || "medium",
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      questionNumber: Number(form.questionNumber),
      options: form.options.filter(Boolean),
    };

    try {
      if (editing) {
        await updateQuestion(editing, payload);
      } else {
        await createQuestion(payload);
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      loadQuestions(page);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save question");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      await deleteQuestion(id);
      loadQuestions(page);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete question");
    }
  };

  return (
    <PageShell
      description="Browse, search, edit, and delete JEE/NEET questions."
      action={
        <div className="flex gap-2">
          <Link
            to="/questions"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:text-slate-200"
          >
            Dashboard
          </Link>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm(emptyForm);
              setShowForm(true);
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
          >
            Add Question
          </button>
        </div>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <QuestionFilters
        filters={filters}
        subjects={subjects}
        shifts={shifts}
        onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
        onSubmit={handleFilterSubmit}
      />

      {showForm && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            {editing ? "Edit Question" : "Add Question"}
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

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
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
                    <span>{question.shift}</span>
                    <span className="capitalize">{question.difficulty}</span>
                  </div>
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
                    onClick={() => startEdit(question)}
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

      <div className="mt-4 flex items-center justify-between">
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
    </PageShell>
  );
}
