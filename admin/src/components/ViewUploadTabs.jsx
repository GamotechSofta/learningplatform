export default function ViewUploadTabs({ activeTab, onTabChange }) {
  return (
    <div className="mb-6 inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={() => onTabChange("view")}
        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          activeTab === "view"
            ? "bg-blue-600 text-white"
            : "text-slate-600 hover:bg-slate-50"
        }`}
      >
        View
      </button>
      <button
        type="button"
        onClick={() => onTabChange("upload")}
        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          activeTab === "upload"
            ? "bg-blue-600 text-white"
            : "text-slate-600 hover:bg-slate-50"
        }`}
      >
        Upload
      </button>
    </div>
  );
}
