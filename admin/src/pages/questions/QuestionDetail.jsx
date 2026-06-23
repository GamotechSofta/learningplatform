import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageShell from "../../components/PageShell";
import MathText from "../../components/questions/MathText";
import { getQuestionById } from "../../services/questionService";

export default function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getQuestionById(id);
        setQuestion(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load question");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading question...</p>;
  }

  if (error || !question) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error || "Question not found"}
      </div>
    );
  }

  return (
    <PageShell
      action={
        <Link
          to="/questions/list"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600 dark:text-slate-200"
        >
          Back to List
        </Link>
      }
    >
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          <span>Q{question.questionNumber}</span>
          <span>{question.subject}</span>
          <span>{question.shift}</span>
          <span className="capitalize">{question.difficulty}</span>
        </div>

        <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">
          Question Details
        </h2>
        <MathText className="mt-4 text-base leading-8">
          {question.question}
        </MathText>

        <div className="mt-6 space-y-3">
          {question.options?.map((option, index) => {
            const label = String(index + 1);
            const isCorrect = label === String(question.correctAnswer);
            return (
              <div
                key={label}
                className={`rounded-xl border px-4 py-4 text-sm ${
                  isCorrect
                    ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <span className="mb-1 block text-xs font-semibold text-slate-500">
                  Option {label}
                </span>
                <MathText as="span">{option}</MathText>
              </div>
            );
          })}
        </div>

        {question.explanation && (
          <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-800">
            <p className="font-medium text-slate-700 dark:text-slate-200">Explanation</p>
            <MathText className="mt-2">{question.explanation}</MathText>
          </div>
        )}
      </div>
    </PageShell>
  );
}
