import ImageUpload from "../ImageUpload";
import RichTextEditor from "./RichTextEditor";
import {
  QUESTION_SUBJECTS,
  DIFFICULTY_OPTIONS,
  getChaptersForSubject,
} from "../../constants/questionOptions";

const emptyForm = {
  questionNumber: "",
  subject: "Mathematics",
  shift: "",
  year: "",
  chapter: "Algebra",
  course: "",
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "1",
  explanation: "",
  difficulty: "medium",
  questionType: "rich",
  image: "",
  tags: [],
  status: "active",
};

export default function QuestionForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  courses = [],
}) {
  const chapters = getChaptersForSubject(form.subject);

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

  const handleSubjectChange = (subject) => {
    const nextChapters = getChaptersForSubject(subject);
    onChange({
      subject,
      chapter: nextChapters[0] || "",
    });
  };

  const useRichText = form.questionType === "rich" || form.questionType === "latex";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {courses.length > 0 && (
          <label className="text-sm text-slate-600 dark:text-slate-300 md:col-span-2">
            Course (optional)
            <select
              value={form.course || ""}
              onChange={(e) => onChange({ course: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="">— No course —</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>
        )}
        <input
          type="number"
          placeholder="Question number (optional)"
          value={form.questionNumber}
          onChange={(e) => onChange({ questionNumber: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        <select
          required
          value={form.subject}
          onChange={(e) => handleSubjectChange(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          {QUESTION_SUBJECTS.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
        <select
          required
          value={form.chapter || chapters[0] || ""}
          onChange={(e) => onChange({ chapter: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          {chapters.map((chapter) => (
            <option key={chapter} value={chapter}>
              {chapter}
            </option>
          ))}
        </select>
        <select
          required
          value={form.difficulty}
          onChange={(e) => onChange({ difficulty: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          {DIFFICULTY_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Year (optional)"
          value={form.year || ""}
          onChange={(e) => onChange({ year: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
        <select
          value={form.questionType || "rich"}
          onChange={(e) => onChange({ questionType: e.target.value })}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="rich">Rich Text</option>
          <option value="latex">LaTeX / Formula</option>
          <option value="image">Image Question</option>
          <option value="text">Plain Text</option>
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
      </div>

      {(form.questionType === "image" || form.image) && (
        <ImageUpload
          folder="questions"
          label="Question Image"
          value={form.image || form.imageUrl || ""}
          onChange={(url) => onChange({ image: url })}
        />
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Question {form.questionType === "latex" ? "(LaTeX supported)" : ""}
        </label>
        {useRichText ? (
          <RichTextEditor
            value={form.question}
            onChange={(html) => onChange({ question: html })}
            placeholder="Enter question text..."
          />
        ) : (
          <textarea
            required
            rows={5}
            value={form.question}
            onChange={(e) => onChange({ question: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        )}
      </div>

      <div className="space-y-2">
        {form.options.map((option, index) => (
          <input
            key={index}
            required
            placeholder={`Option ${index + 1}`}
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
