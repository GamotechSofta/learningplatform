import Question from "../models/question.js";
import TestAttempt from "../models/testAttempt.js";
import asyncHandler from "../middleware/asyncHandler.js";
import {
  buildQuestionQuery,
  getQuestionStats,
  importQuestionsFromCsv,
} from "../services/questionService.js";
import { sanitizeQuestionForTest } from "../utils/questionParser.js";

const getPagination = (query) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const getQuestions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildQuestionQuery(req.query);
  const forTest = req.query.forTest === "true";

  const [questions, total] = await Promise.all([
    Question.find(filter)
      .sort({ questionNumber: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Question.countDocuments(filter),
  ]);

  const data = forTest
    ? questions.map((question) => sanitizeQuestionForTest(question))
    : questions;

  res.json({
    success: true,
    count: data.length,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    data,
  });
});

export const getQuestionById = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  const output =
    req.query.forTest === "true"
      ? sanitizeQuestionForTest(question)
      : question;

  res.json({ success: true, data: output });
});

export const getQuestionsBySubject = asyncHandler(async (req, res) => {
  req.query.subject = req.params.subject;
  return getQuestions(req, res);
});

export const getQuestionStatsHandler = asyncHandler(async (req, res) => {
  const stats = await getQuestionStats();
  res.json({ success: true, data: stats });
});

export const createQuestion = asyncHandler(async (req, res) => {
  const question = await Question.create(req.body);
  res.status(201).json({ success: true, data: question });
});

export const updateQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  res.json({ success: true, data: question });
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findByIdAndDelete(req.params.id);
  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  res.json({ success: true, message: "Question deleted" });
});

export const deleteAllQuestions = asyncHandler(async (req, res) => {
  const filter = buildQuestionQuery(req.query);
  const result = await Question.deleteMany(filter);
  res.json({
    success: true,
    message: `${result.deletedCount} question(s) deleted`,
    deletedCount: result.deletedCount,
  });
});

export const importQuestions = asyncHandler(async (req, res) => {
  const stats = await importQuestionsFromCsv({
    url: req.body?.url,
    csvText: req.body?.csvText,
    clearExisting: Boolean(req.body?.clearExisting),
  });

  res.status(201).json({
    success: true,
    message: "Questions imported successfully",
    data: stats,
  });
});

export const submitTest = asyncHandler(async (req, res) => {
  const {
    answers = [],
    subject,
    shift,
    durationSeconds = 0,
    autoSubmitted = false,
  } = req.body;

  if (!Array.isArray(answers) || answers.length === 0) {
    res.status(400);
    throw new Error("answers array is required");
  }

  const questionIds = answers.map((item) => item.questionId).filter(Boolean);
  const questions = await Question.find({ _id: { $in: questionIds } }).lean();
  const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

  let correct = 0;
  let incorrect = 0;
  let unattempted = 0;
  let markedForReview = 0;

  const evaluatedAnswers = answers.map((item) => {
    const question = questionMap.get(String(item.questionId));
    const selectedAnswer = String(item.selectedAnswer || "").trim();
    const correctAnswer = question?.correctAnswer || "";
    const isCorrect =
      Boolean(selectedAnswer) &&
      selectedAnswer === String(correctAnswer).trim();

    if (!selectedAnswer) unattempted += 1;
    else if (isCorrect) correct += 1;
    else incorrect += 1;

    if (item.markedForReview) markedForReview += 1;

    return {
      question: item.questionId,
      selectedAnswer,
      correctAnswer,
      isCorrect,
      markedForReview: Boolean(item.markedForReview),
      questionText: question?.question || "",
      options: question?.options || [],
      explanation: question?.explanation || "",
      subject: question?.subject || "",
      shift: question?.shift || "",
      questionNumber: question?.questionNumber || null,
    };
  });

  const total = answers.length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;

  const attempt = await TestAttempt.create({
    user: req.user?._id,
    subject,
    shift,
    answers: evaluatedAnswers.map((item) => ({
      question: item.question,
      selectedAnswer: item.selectedAnswer,
      isCorrect: item.isCorrect,
      correctAnswer: item.correctAnswer,
      markedForReview: item.markedForReview,
    })),
    score,
    total,
    correct,
    incorrect,
    unattempted,
    markedForReview,
    durationSeconds,
    autoSubmitted,
  });

  res.json({
    success: true,
    data: {
      attemptId: attempt._id,
      score,
      total,
      correct,
      incorrect,
      unattempted,
      markedForReview,
      durationSeconds,
      autoSubmitted,
      answers: evaluatedAnswers,
    },
  });
});
