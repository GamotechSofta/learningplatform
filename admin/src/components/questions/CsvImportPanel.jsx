import { useRef, useState } from "react";
import { importQuestions, previewCsvImport } from "../../services/questionService";

export default function CsvImportPanel({ courseId, courseName, onComplete, onError }) {
  const fileRef = useRef(null);
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState(null);
  const [previewing, setPreviewing] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCsvText(text);
    setFileName(file.name);
    setPreview(null);
    setReport(null);
  };

  const handlePreview = async () => {
    if (!csvText) {
      onError("Upload a CSV file first");
      return;
    }

    try {
      setPreviewing(true);
      const data = await previewCsvImport(csvText, courseId || null);
      setPreview(data);
    } catch (err) {
      onError(err.response?.data?.message || "Preview failed");
    } finally {
      setPreviewing(false);
    }
  };

  const handleImport = async () => {
    if (!csvText) {
      onError("Upload a CSV file first");
      return;
    }

    try {
      setImporting(true);
      setProgress(10);
      const timer = setInterval(() => {
        setProgress((p) => (p < 90 ? p + 8 : p));
      }, 300);

      const result = await importQuestions({
        csvText,
        ...(courseId ? { courseId } : {}),
        skipDuplicates: true,
      });
      clearInterval(timer);
      setProgress(100);
      setReport(result.data);
      onComplete?.(result.data);
    } catch (err) {
      onError(err.response?.data?.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Bulk CSV Upload</h3>
        <p className="mt-1 text-sm text-slate-500">
          <strong>Required:</strong> Question, Option1–4, CorrectAnswer, Explanation
          <br />
          <strong>Optional:</strong> Subject, Chapter, Difficulty, Course
          {courseName && (
            <span className="mt-1 block font-medium text-blue-700 dark:text-blue-300">
              Default course: {courseName} (override with Course column in CSV)
            </span>
          )}
          {!courseName && (
            <span className="mt-1 block text-amber-700 dark:text-amber-300">
              Course not selected — add Course column in CSV or select course above
            </span>
          )}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:text-slate-200"
        >
          Upload CSV File
        </button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
        {fileName && <span className="self-center text-sm text-slate-500">{fileName}</span>}
        <button
          type="button"
          onClick={handlePreview}
          disabled={!csvText || previewing}
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {previewing ? "Validating..." : "Preview & Validate"}
        </button>
        <button
          type="button"
          onClick={handleImport}
          disabled={!csvText || importing}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {importing ? "Importing..." : "Import All Questions"}
        </button>
      </div>

      {importing && (
        <div>
          <div className="mb-1 flex justify-between text-xs text-slate-500">
            <span>Import progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {preview && (
        <div className="space-y-4">
          <div
            className={`rounded-lg px-3 py-2 text-sm ${
              preview.columnCheck?.valid
                ? "border border-green-200 bg-green-50 text-green-800"
                : "border border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            {preview.columnCheck?.message}
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <Stat label="Total Rows" value={preview.totalRows} />
            <Stat label="Valid" value={preview.validCount} tone="green" />
            <Stat label="Invalid" value={preview.invalidCount} tone="red" />
            <Stat label="Duplicates" value={preview.duplicateCount} tone="amber" />
          </div>

          {preview.preview?.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                Preview (first {preview.preview.length} valid rows)
              </h4>
              <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Question</th>
                      <th className="px-3 py-2">Subject</th>
                      <th className="px-3 py-2">Chapter</th>
                      <th className="px-3 py-2">Course</th>
                      <th className="px-3 py-2">Answer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.preview.map((row) => (
                      <tr key={row.rowIndex} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="px-3 py-2">{row.rowIndex}</td>
                        <td className="max-w-xs truncate px-3 py-2">{row.question}</td>
                        <td className="px-3 py-2">{row.subject}</td>
                        <td className="px-3 py-2">{row.chapter}</td>
                        <td className="px-3 py-2">{row.courseName || "—"}</td>
                        <td className="px-3 py-2">{row.correctAnswer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {preview.duplicateRows?.length > 0 && (
            <AlertList
              title="Duplicate Questions"
              items={preview.duplicateRows.map(
                (r) => `Row ${r.rowIndex}: ${r.duplicateType} duplicate — ${r.question.slice(0, 80)}`
              )}
            />
          )}

          {preview.invalidRows?.length > 0 && (
            <AlertList
              title="Validation Errors"
              items={preview.invalidRows.map(
                (r) => `Row ${r.rowIndex}: ${r.errors?.join(", ")}`
              )}
            />
          )}
        </div>
      )}

      {report && (
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <h4 className="font-medium text-slate-900 dark:text-white">Import Report</h4>
          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            <Stat label="Imported" value={report.imported} tone="green" />
            <Stat label="Updated" value={report.updated} />
            <Stat label="Skipped" value={report.skipped} tone="amber" />
            <Stat label="Failed" value={report.failed} tone="red" />
          </div>
          {report.failedRecords?.length > 0 && (
            <AlertList
              title="Failed Records"
              items={report.failedRecords.map(
                (r) => `Row ${r.rowIndex}: ${r.errors?.join(", ")}`
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }) {
  const colors = {
    green: "text-green-700 dark:text-green-300",
    red: "text-red-700 dark:text-red-300",
    amber: "text-amber-700 dark:text-amber-300",
  };

  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-xl font-semibold ${colors[tone] || "text-slate-900 dark:text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function AlertList({ title, items }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30">
      <h4 className="text-sm font-medium text-red-800 dark:text-red-200">{title}</h4>
      <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-red-700 dark:text-red-300">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
