const TABS = [
  { id: "questions", label: "Question Management" },
  { id: "tests", label: "Test Management" },
  { id: "settings", label: "Test Settings" },
];

export default function TestManagementTabs({ activeTab, onTabChange }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export { TABS };
