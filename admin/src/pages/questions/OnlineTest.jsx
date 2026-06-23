import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../../components/PageShell";
import MathText from "../../components/questions/MathText";
import QuestionPalette from "../../components/test/QuestionPalette";
import TestTimer from "../../components/test/TestTimer";
import { getQuestions } from "../../services/questionService";
import { submitTest } from "../../services/testService";
import { prepareTestQuestion } from "../../utils/mathDisplay";

const TEST_DURATION_SECONDS = 45 * 60;

export default function OnlineTest() {
  const navigate = useNavigate();
  const startedAt = useRef(Date.now());
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(TEST_DURATION_SECONDS);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [limit, setLimit] = useState(25);
  const [started, setStarted] = useState(false);

  const currentQuestion = questions[currentIndex];

  const displayQuestion = useMemo(() => {
    if (!currentQuestion) {
      return { questionText: "", options: [], mathBlock: "" };
    }
    return prepareTestQuestion(currentQuestion.question, currentQuestion.options);
  }, [currentQuestion]);

  const handleSubmit = useCallback(
    async (autoSubmitted = false) => {
      if (submitting || questions.length === 0) return;
      setSubmitting(true);

      try {
        const payload = {
          subject,
          durationSeconds: Math.round((Date.now() - startedAt.current) / 1000),
          autoSubmitted,
          answers: questions.map((question) => ({
            questionId: question._id,
            selectedAnswer: answers[question._id]?.selectedAnswer || "",
            markedForReview: Boolean(answers[question._id]?.markedForReview),
          })),
        };

        const result = await submitTest(payload);
        navigate("/questions/test/result", { state: { result } });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to submit test");
        setSubmitting(false);
      }
    },
    [answers, navigate, questions, subject, submitting]
  );

  useEffect(() => {
    if (!started) return undefined;
    const timer = setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [started]);

  useEffect(() => {
    if (!started || submitting || secondsLeft > 0) return;
    handleSubmit(true);
  }, [secondsLeft, started, submitting, handleSubmit]);

  const loadTest = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getQuestions({
        subject,
        limit,
        forTest: true,
      });

      if (!result.data?.length) {
        setError(
          `No questions found for "${subject}". Import questions first from JEE/NEET Questions dashboard.`
        );
        return;
      }

      setQuestions(result.data);
      setStarted(true);
      setCurrentIndex(0);
      setAnswers({});
      setSecondsLeft(TEST_DURATION_SECONDS);
      startedAt.current = Date.now();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load test questions");
    } finally {
      setLoading(false);
    }
  };

  const updateAnswer = (patch) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion._id]: {
        ...prev[currentQuestion._id],
        ...patch,
      },
    }));
  };

  const answeredCount = useMemo(
    () =>
      questions.filter((question) => answers[question._id]?.selectedAnswer).length,
    [answers, questions]
  );

  if (!started) {
    return (
      <PageShell description="Configure and start a timed JEE/NEET practice test.">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <div className="space-y-4">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            <input
              type="number"
              min="5"
              max="100"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={loadTest}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
            >
              {loading ? "Loading..." : "Start Test"}
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No questions yet? Go to{" "}
              <a href="/questions" className="text-blue-600 hover:underline">
                JEE/NEET Questions
              </a>{" "}
              and click Import Questions.
            </p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (!currentQuestion) {
    return <p className="text-sm text-slate-500">No questions available for this test.</p>;
  }

  return (
    <PageShell>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">
                Question {currentIndex + 1} of {questions.length}
              </p>
              <p className="text-xs text-slate-400">
                Answered {answeredCount}/{questions.length}
              </p>
            </div>
            <TestTimer secondsLeft={secondsLeft} />
          </div>

          <MathText className="text-base leading-8">
            {displayQuestion.questionText}
          </MathText>

          {displayQuestion.mathBlock ? (
            <MathText className="my-4 text-base leading-8">
              {`\\[${displayQuestion.mathBlock}\\]`}
            </MathText>
          ) : null}

          <div className="mt-6 space-y-3">
            {displayQuestion.options?.map((option, index) => {
              const value = String(index + 1);
              const selected = answers[currentQuestion._id]?.selectedAnswer === value;
              return (
                <label
                  key={value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-4 text-sm transition-colors ${
                    selected
                      ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/40"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion._id}`}
                    checked={selected}
                    onChange={() => updateAnswer({ selectedAnswer: value })}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Option {value}
                    </span>
                    <MathText as="span" className="text-sm leading-7">
                      {option}
                    </MathText>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((value) => value - 1)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={currentIndex >= questions.length - 1}
              onClick={() => setCurrentIndex((value) => value + 1)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm disabled:opacity-50"
            >
              Next
            </button>
            <button
              type="button"
              onClick={() =>
                updateAnswer({
                  markedForReview: !answers[currentQuestion._id]?.markedForReview,
                })
              }
              className="rounded-lg border border-amber-300 px-4 py-2 text-sm text-amber-700"
            >
              {answers[currentQuestion._id]?.markedForReview
                ? "Unmark Review"
                : "Mark For Review"}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Test"}
            </button>
          </div>
        </div>

        <QuestionPalette
          questions={questions}
          currentIndex={currentIndex}
          answers={answers}
          onJump={setCurrentIndex}
        />
      </div>
    </PageShell>
  );
}
