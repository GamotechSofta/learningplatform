import { useEffect, useState } from "react";
import TestSettingsForm from "./TestSettingsForm";
import {
  createTest,
  emptyTestForm,
  formToPayload,
  getTestById,
  testToForm,
  updateTest,
} from "../../services/testService";
import { getQuestions } from "../../services/questionService";

export default function TestSettingsTab({
  selectedTestId,
  isCreating,
  onSaved,
  onCancelCreate,
  onMessage,
  onError,
}) {
  const [form, setForm] = useState(emptyTestForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [questionOptions, setQuestionOptions] = useState([]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const result = await getQuestions({ limit: 100 });
        setQuestionOptions(result.data || []);
      } catch {
        setQuestionOptions([]);
      }
    };
    loadQuestions();
  }, []);

  useEffect(() => {
    if (isCreating) {
      setForm(emptyTestForm);
      return;
    }

    if (!selectedTestId) {
      setForm(emptyTestForm);
      return;
    }

    const loadTest = async () => {
      try {
        setLoading(true);
        const test = await getTestById(selectedTestId);
        setForm(testToForm(test));
      } catch (err) {
        onError(err.response?.data?.message || "Failed to load test settings");
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [selectedTestId, isCreating]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = formToPayload(form);

      if (isCreating || !selectedTestId) {
        const created = await createTest(payload);
        onMessage(`Test created: ${created.name}`);
        onSaved(created._id);
      } else {
        const updated = await updateTest(selectedTestId, payload);
        onMessage(`Test updated: ${updated.name}`);
        onSaved(updated._id);
      }
    } catch (err) {
      onError(err.response?.data?.message || "Failed to save test");
    } finally {
      setSaving(false);
    }
  };

  if (!isCreating && !selectedTestId) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-600 dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-300">
          Select a test from Test Management or click Create Test to configure settings.
        </p>
      </div>
    );
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading test settings...</p>;
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {isCreating ? "Create New Test" : "Test Settings"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Configure test name, duration, marks, negative marking, shuffle, dates, attempts & paid/free.
        </p>
      </div>
      <TestSettingsForm
        form={form}
        onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
        onSubmit={handleSubmit}
        onCancel={isCreating ? onCancelCreate : undefined}
        submitLabel={saving ? "Saving..." : isCreating ? "Create Test" : "Save Settings"}
        questionOptions={questionOptions}
      />
    </div>
  );
}
