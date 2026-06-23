import { Link } from "react-router-dom";
import PageShell from "../../components/PageShell";
import SubjectStats from "../../components/questions/SubjectStats";
import {
  deleteQuestionsBulk,
  getQuestionStats,
  importQuestions,
} from "../../services/questionService";

import { useEffect, useState } from "react";

export default function QuestionDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getQuestionStats();
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load question stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleImport = async () => {
    try {
      setImporting(true);
      setError("");
      const result = await importQuestions({ clearExisting: false });
      setMessage(
        `Imported ${result.data.imported}, updated ${result.data.updated}, skipped ${result.data.skipped}`
      );
      await loadStats();
    } catch (err) {
      setError(err.response?.data?.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Delete all Mathematics questions?")) return;
    try {
      await deleteQuestionsBulk({ subject: "Mathematics" });
      setMessage("Mathematics questions deleted");
      await loadStats();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <PageShell
      description="Manage JEE/NEET questions, import dataset, and launch online tests."
      action={
        <div className="flex flex-wrap gap-2">
          <Link
            to="/questions/list"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 dark:border-slate-600 dark:text-slate-200"
          >
            View Questions
          </Link>
          <Link
            to="/questions/test"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            Start Online Test
          </Link>
        </div>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading stats...</p>
      ) : (
        <SubjectStats stats={stats} />
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Import Dataset</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Import JEE Mains Mathematics questions from HuggingFace CSV.
          </p>
          <button
            type="button"
            onClick={handleImport}
            disabled={importing}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {importing ? "Importing..." : "Import Questions"}
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Subject Breakdown</h2>
          <div className="mt-4 space-y-2">
            {(stats?.bySubject || []).map((item) => (
              <div
                key={item.subject}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800"
              >
                <span>{item.subject}</span>
                <span className="font-medium">{item.count}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-300"
          >
            Delete Mathematics Questions
          </button>
        </div>
      </div>
    </PageShell>
  );
}
