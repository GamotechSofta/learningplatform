import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageShell from "../../components/PageShell";
import TestManagementTabs from "../../components/test/TestManagementTabs";
import QuestionManagementTab from "../../components/test/QuestionManagementTab";
import TestListTab from "../../components/test/TestListTab";

export default function TestManagementHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab =
    searchParams.get("tab") === "settings" ? "tests" : searchParams.get("tab") || "questions";
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  const showMessage = (text) => {
    setMessage(text);
    setError("");
  };

  const showError = (text) => {
    setError(text);
    setMessage("");
  };

  return (
    <PageShell
      description="Manage questions, create tests, and configure test settings for JEE/NEET."
      action={
        <Link
          to="/questions/test"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          Start Online Test
        </Link>
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

      <TestManagementTabs activeTab={activeTab} onTabChange={setTab} />

      {activeTab === "questions" && (
        <QuestionManagementTab onMessage={showMessage} onError={showError} />
      )}

      {activeTab === "tests" && (
        <TestListTab onMessage={showMessage} onError={showError} />
      )}
    </PageShell>
  );
}
