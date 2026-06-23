import Question from "../models/question.js";
import QuestionVersion from "../models/questionVersion.js";
import TestAttempt from "../models/testAttempt.js";
import asyncHandler from "../middleware/asyncHandler.js";
import {
  buildQuestionQuery,
  exportQuestions,
  findDuplicateQuestions,
  getQuestionStats,
  getSortOption,
  importQuestionsFromCsv,
  previewCsvImport,
  questionsToCsv,
  saveQuestionVersion,
} from "../services/questionService.js";
import {
  normalizeQuestionPayload,
  sanitizeQuestionForTest,
} from "../utils/questionParser.js";

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
  const sort = getSortOption(req.query.sort);

  const [questions, total] = await Promise.all([
    Question.find(filter).sort(sort).skip(skip).limit(limit).lean(),
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
  const stats = await getQuestionStats(req.query.course);
  res.json({ success: true, data: stats });
});

export const getDuplicateQuestions = asyncHandler(async (req, res) => {
  const duplicates = await findDuplicateQuestions(req.query.course);
  res.json({ success: true, data: duplicates });
});

export const previewImport = asyncHandler(async (req, res) => {
  if (!req.body?.csvText) {
    res.status(400);
    throw new Error("csvText is required");
  }

  const preview = await previewCsvImport(req.body.csvText, req.body.courseId || null);
  res.json({ success: true, data: preview });
});

export const createQuestion = asyncHandler(async (req, res) => {
  const payload = normalizeQuestionPayload(req.body);
  const question = await Question.create({
    ...payload,
    createdBy: req.user?._id,
    version: 1,
  });

  res.status(201).json({ success: true, data: question });
});

export const updateQuestion = asyncHandler(async (req, res) => {
  const existing = await Question.findById(req.params.id);
  if (!existing) {
    res.status(404);
    throw new Error("Question not found");
  }

  await saveQuestionVersion(existing, req.user?._id, req.body?.changeNote || "Updated");

  const payload = normalizeQuestionPayload({ ...existing.toObject(), ...req.body });
  Object.assign(existing, payload, { version: (existing.version || 1) + 1 });
  await existing.save();

  res.json({ success: true, data: existing });
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );

  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  res.json({ success: true, message: "Question moved to trash", data: question });
});

export const permanentDeleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findByIdAndDelete(req.params.id);
  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  await QuestionVersion.deleteMany({ questionId: req.params.id });
  res.json({ success: true, message: "Question permanently deleted" });
});

export const restoreQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findByIdAndUpdate(
    req.params.id,
    { isDeleted: false, deletedAt: null },
    { new: true }
  );

  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  res.json({ success: true, message: "Question restored", data: question });
});

export const bulkSoftDelete = asyncHandler(async (req, res) => {
  const ids = req.body?.ids || [];
  if (!Array.isArray(ids) || !ids.length) {
    res.status(400);
    throw new Error("ids array is required");
  }

  const result = await Question.updateMany(
    { _id: { $in: ids } },
    { isDeleted: true, deletedAt: new Date() }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} question(s) deleted`,
    modifiedCount: result.modifiedCount,
  });
});

export const bulkRestore = asyncHandler(async (req, res) => {
  const ids = req.body?.ids || [];
  if (!Array.isArray(ids) || !ids.length) {
    res.status(400);
    throw new Error("ids array is required");
  }

  const result = await Question.updateMany(
    { _id: { $in: ids } },
    { isDeleted: false, deletedAt: null }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} question(s) restored`,
    modifiedCount: result.modifiedCount,
  });
});

export const bulkUpdateQuestions = asyncHandler(async (req, res) => {
  const ids = req.body?.ids || [];
  const updates = req.body?.updates || {};

  if (!Array.isArray(ids) || !ids.length) {
    res.status(400);
    throw new Error("ids array is required");
  }

  const allowed = {};
  if (updates.difficulty) allowed.difficulty = updates.difficulty;
  if (updates.subject) allowed.subject = updates.subject;
  if (updates.chapter !== undefined) allowed.chapter = updates.chapter;
  if (updates.status) allowed.status = updates.status;
  if (updates.year) allowed.year = Number(updates.year);
  if (updates.tags) {
    allowed.tags = Array.isArray(updates.tags)
      ? updates.tags
      : String(updates.tags).split(",").map((t) => t.trim()).filter(Boolean);
  }

  const result = await Question.updateMany({ _id: { $in: ids } }, { $set: allowed });

  res.json({
    success: true,
    message: `${result.modifiedCount} question(s) updated`,
    modifiedCount: result.modifiedCount,
  });
});

export const deleteAllQuestions = asyncHandler(async (req, res) => {
  const filter = buildQuestionQuery(req.query);
  const hard = req.query.hard === "true";

  if (hard) {
    const result = await Question.deleteMany(filter);
    return res.json({
      success: true,
      message: `${result.deletedCount} question(s) permanently deleted`,
      deletedCount: result.deletedCount,
    });
  }

  const result = await Question.updateMany(filter, {
    isDeleted: true,
    deletedAt: new Date(),
  });

  res.json({
    success: true,
    message: `${result.modifiedCount} question(s) moved to trash`,
    modifiedCount: result.modifiedCount,
  });
});

export const importQuestions = asyncHandler(async (req, res) => {
  const stats = await importQuestionsFromCsv({
    url: req.body?.url,
    csvText: req.body?.csvText,
    clearExisting: Boolean(req.body?.clearExisting),
    skipDuplicates: req.body?.skipDuplicates !== false,
    courseId: req.body?.courseId || null,
  });

  res.status(201).json({
    success: true,
    message: "Import completed",
    data: stats,
  });
});

export const cloneQuestion = asyncHandler(async (req, res) => {
  const source = await Question.findById(req.params.id).lean();
  if (!source) {
    res.status(404);
    throw new Error("Question not found");
  }

  const { _id, uuid, createdAt, updatedAt, version, ...rest } = source;
  const clone = await Question.create({
    ...rest,
    question: `${rest.question} (Copy)`,
    createdBy: req.user?._id,
    version: 1,
    status: "draft",
  });

  res.status(201).json({ success: true, data: clone });
});

export const getQuestionVersions = asyncHandler(async (req, res) => {
  const versions = await QuestionVersion.find({ questionId: req.params.id })
    .sort({ version: -1 })
    .limit(20)
    .lean();

  res.json({ success: true, data: versions });
});

export const exportQuestionsHandler = asyncHandler(async (req, res) => {
  const questions = await exportQuestions(req.query);
  const format = req.query.format || "json";

  if (format === "csv") {
    const csv = questionsToCsv(questions);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="questions.csv"');
    return res.send(csv);
  }

  res.json({ success: true, count: questions.length, data: questions });
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
  const questions = await Question.find({
    _id: { $in: questionIds },
    isDeleted: { $ne: true },
  }).lean();
  const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

  let correct = 0;
  let incorrect = 0;
  let unattempted = 0;
  let markedForReview = 0;

  const evaluatedAnswers = answers.map((item) => {
    const question = questionMap.get(String(item.questionId));
    const selectedAnswer = String(item.selectedAnswer || "").trim();
    const correctAnswer = question?.correctAnswer ?? "";
    const isCorrect =
      Boolean(selectedAnswer) &&
      Number(selectedAnswer) === Number(correctAnswer);

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
