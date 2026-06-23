import Test from "../models/test.js";
import TestAttempt from "../models/testAttempt.js";
import Question from "../models/question.js";
import User from "../models/user.js";
import PaymentOrder from "../models/paymentOrder.js";

export const getTestDashboardStats = async () => {
  const [
    totalQuestions,
    totalTests,
    totalStudents,
    activeTests,
    totalAttempts,
    revenueResult,
    bySubject,
  ] = await Promise.all([
    Question.countDocuments(),
    Test.countDocuments(),
    User.countDocuments({ role: "student" }),
    Test.countDocuments({ status: "published" }),
    TestAttempt.countDocuments(),
    PaymentOrder.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Question.aggregate([
      { $group: { _id: "$subject", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { subject: "$_id", count: 1, _id: 0 } },
    ]),
  ]);

  return {
    totalQuestions,
    totalTests,
    totalStudents,
    activeTests,
    totalAttempts,
    revenue: revenueResult[0]?.total || 0,
    bySubject,
  };
};

export const buildTestQuery = (query = {}) => {
  const filter = {};

  if (query.course) filter.course = query.course;

  if (query.status) filter.status = query.status;
  if (query.subject) filter.subject = query.subject;
  if (query.q) {
    filter.$or = [
      { name: { $regex: query.q, $options: "i" } },
      { subject: { $regex: query.q, $options: "i" } },
      { chapter: { $regex: query.q, $options: "i" } },
    ];
  }

  return filter;
};

export const serializeTest = (test) => {
  if (!test) return test;
  const doc = test.toObject ? test.toObject() : test;
  return {
    ...doc,
    questionCount: doc.questionCount || doc.questions?.length || 0,
    assignedCount: doc.questions?.length || 0,
  };
};

const shuffleIds = (ids) => {
  const copy = [...ids];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const pickQuestionsFromCourse = async (
  courseId,
  questionCount,
  shuffleQuestions = true
) => {
  const pool = await Question.find({
    course: courseId,
    isDeleted: { $ne: true },
    status: { $ne: "archived" },
  })
    .select("_id")
    .lean();

  if (!pool.length) {
    throw new Error("No questions found for this course. Add questions in Question Management first.");
  }

  const count = Number(questionCount);
  if (!count || count < 1) {
    throw new Error("Number of questions must be at least 1");
  }

  if (count > pool.length) {
    throw new Error(`Only ${pool.length} question(s) available in this course`);
  }

  let ids = pool.map((q) => q._id);
  if (shuffleQuestions) {
    ids = shuffleIds(ids);
  }

  return ids.slice(0, count);
};

export const buildTestPayload = async (body) => {
  const courseId = body.course || body.courseId;
  if (!courseId) {
    throw new Error("course is required");
  }

  const questionCount = Number(body.questionCount);
  if (!body.name?.trim()) {
    throw new Error("Test name is required");
  }

  const questions = await pickQuestionsFromCourse(
    courseId,
    questionCount,
    body.shuffleQuestions !== false
  );

  return {
    name: body.name?.trim(),
    course: courseId,
    durationMinutes: Number(body.durationMinutes) || 180,
    totalMarks: Number(body.totalMarks) || 100,
    questionCount,
    shuffleQuestions: body.shuffleQuestions !== false,
    shuffleOptions: body.shuffleOptions !== false,
    negativeMarking: {
      enabled: Boolean(body.negativeMarking?.enabled),
      perQuestion: Number(body.negativeMarking?.perQuestion) || 1,
    },
    questions,
    status: body.status || "draft",
  };
};
