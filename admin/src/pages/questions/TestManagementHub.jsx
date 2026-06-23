import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageShell from "../../components/PageShell";
import TestDashboardStats from "../../components/test/TestDashboardStats";
import TestManagementTabs from "../../components/test/TestManagementTabs";
import QuestionManagementTab from "../../components/test/QuestionManagementTab";
import TestListTab from "../../components/test/TestListTab";
import TestSettingsTab from "../../components/test/TestSettingsTab";
import { getDashboardStats } from "../../services/testService";

export default function TestManagementHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "questions";
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard stats");
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  const showMessage = (text) => {
    setMessage(text);
    setError("");
    loadStats();
  };

  const showError = (text) => {
    setError(text);
    setMessage("");
  };

  const handleCreateTest = () => {
    setSelectedTestId(null);
    setIsCreating(true);
    setTab("settings");
  };

  const handleEditSettings = (testId) => {
    setSelectedTestId(testId);
    setIsCreating(false);
    setTab("settings");
  };

  const handleTestSaved = (testId) => {
    setSelectedTestId(testId);
    setIsCreating(false);
    setTab("tests");
    loadStats();
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

      {statsLoading ? (
        <p className="mb-6 text-sm text-slate-500">Loading dashboard...</p>
      ) : (
        <div className="mb-8">
          <TestDashboardStats stats={stats} />
        </div>
      )}

      <TestManagementTabs activeTab={activeTab} onTabChange={setTab} />

      {activeTab === "questions" && (
        <QuestionManagementTab onMessage={showMessage} onError={showError} />
      )}

      {activeTab === "tests" && (
        <TestListTab
          selectedTestId={selectedTestId}
          onSelectTest={(id) => {
            setSelectedTestId(id);
            setIsCreating(false);
          }}
          onCreateTest={handleCreateTest}
          onEditSettings={handleEditSettings}
          onMessage={showMessage}
          onError={showError}
        />
      )}

      {activeTab === "settings" && (
        <TestSettingsTab
          selectedTestId={selectedTestId}
          isCreating={isCreating}
          onSaved={handleTestSaved}
          onCancelCreate={() => {
            setIsCreating(false);
            setTab("tests");
          }}
          onMessage={showMessage}
          onError={showError}
        />
      )}
    </PageShell>
  );
}
