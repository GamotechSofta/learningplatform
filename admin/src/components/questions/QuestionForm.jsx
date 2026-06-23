import ImageUpload from "../ImageUpload";

const emptyForm = {
  questionNumber: "",
  subject: "Mathematics",
  shift: "",
  chapter: "",
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "1",
  explanation: "",
  difficulty: "medium",
  questionType: "text",
  imageUrl: "",
  tags: [],
};

export default function QuestionForm({ form, onChange, onSubmit, onCancel, submitLabel }) {
  const updateOption = (index, value) => {
    const options = [...form.options];
    options[index] = value;
    onChange({ options });
  };

  const updateTags = (value) => {
    onChange({
      tags: value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <input
          type="number"
          required
          placeholder="Question number"
          value={form.questionNumber}
          onChange={(e) => onChange({ questionNumber: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        <input
          required
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => onChange({ subject: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        <input
          placeholder="Chapter"
          value={form.chapter || ""}
          onChange={(e) => onChange({ chapter: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        <input
          required
          placeholder="Shift"
          value={form.shift}
          onChange={(e) => onChange({ shift: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        <select
          value={form.difficulty}
          onChange={(e) => onChange({ difficulty: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select
          value={form.questionType || "text"}
          onChange={(e) => onChange({ questionType: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="text">Text Question</option>
          <option value="image">Image Question</option>
          <option value="latex">Formula/LaTeX Question</option>
        </select>
        <select
          value={form.correctAnswer}
          onChange={(e) => onChange({ correctAnswer: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          {form.options.map((_, index) => (
            <option key={index + 1} value={String(index + 1)}>
              Option {index + 1}
            </option>
          ))}
        </select>
        <input
          placeholder="Tags (comma separated)"
          value={(form.tags || []).join(", ")}
          onChange={(e) => updateTags(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 md:col-span-2"
        />
      </div>

      {(form.questionType === "image" || form.imageUrl) && (
        <ImageUpload
          folder="questions"
          label="Question Image"
          value={form.imageUrl}
          onChange={(url) => onChange({ imageUrl: url })}
        />
      )}

      <textarea
        required
        rows={5}
        placeholder={
          form.questionType === "latex"
            ? "Question text with LaTeX e.g. $x^2 + y^2 = r^2$"
            : "Question text"
        }
        value={form.question}
        onChange={(e) => onChange({ question: e.target.value })}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      />

      <div className="space-y-2">
        {form.options.map((option, index) => (
          <input
            key={index}
            required
            placeholder={`Option ${index + 1}${form.questionType === "latex" ? " (LaTeX supported)" : ""}`}
            value={option}
            onChange={(e) => updateOption(index, e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        ))}
      </div>

      <textarea
        rows={3}
        placeholder="Explanation / Solution (optional)"
        value={form.explanation}
        onChange={(e) => onChange({ explanation: e.target.value })}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
      />

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 dark:border-slate-600 dark:text-slate-300"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export { emptyForm };
