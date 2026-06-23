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

const hashSeed = (value) => {
  let hash = 2166136261;
  const input = String(value);
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const createRng = (seed) => {
  let state = seed;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const seededShuffleIds = (ids, seedKey) => {
  const rng = createRng(hashSeed(seedKey));
  const copy = [...ids];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const getPriorTestsForCourse = async (courseId, excludeTestId = null) => {
  const filter = { course: courseId };
  if (excludeTestId) {
    filter._id = { $ne: excludeTestId };
  }

  return Test.find(filter).sort({ createdAt: 1, _id: 1 }).select("questions").lean();
};

const pickFromShuffledRound = (allIds, courseId, roundIndex, offset, count) => {
  const poolSize = allIds.length;
  const shuffled = seededShuffleIds(allIds, `${courseId}-round-${roundIndex}`);
  const available = poolSize - offset;

  if (available >= count) {
    return shuffled.slice(offset, offset + count);
  }

  const fromCurrent = shuffled.slice(offset);
  const needed = count - fromCurrent.length;
  const nextRound = seededShuffleIds(allIds, `${courseId}-round-${roundIndex + 1}`);
  return [...fromCurrent, ...nextRound.slice(0, needed)];
};

export const pickQuestionsFromCourse = async (
  courseId,
  questionCount,
  shuffleQuestions = true,
  excludeTestId = null
) => {
  const pool = await Question.find({
    course: courseId,
    isDeleted: { $ne: true },
    status: { $ne: "archived" },
  })
    .sort({ createdAt: 1, _id: 1 })
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

  const allIds = pool.map((q) => q._id);
  const priorTests = await getPriorTestsForCourse(courseId, excludeTestId);
  let totalPriorAssigned = 0;
  const usedIds = new Set();

  for (const test of priorTests) {
    for (const questionId of test.questions || []) {
      if (questionId) {
        usedIds.add(String(questionId));
      }
    }
    totalPriorAssigned += test.questions?.length || 0;
  }

  const poolSize = allIds.length;
  const roundIndex = Math.floor(totalPriorAssigned / poolSize);
  const offsetInRound = totalPriorAssigned % poolSize;
  const unusedIds = allIds.filter((id) => !usedIds.has(String(id)));

  let selected;

  if (roundIndex === 0) {
    if (unusedIds.length >= count) {
      // First cycle: next unused questions in stable order.
      selected = unusedIds.slice(0, count);
    } else if (unusedIds.length > 0) {
      // End of first cycle — use leftovers, then start random cycle.
      const needed = count - unusedIds.length;
      const roundOne = seededShuffleIds(allIds, `${courseId}-round-1`);
      selected = [...unusedIds, ...roundOne.slice(0, needed)];
    } else {
      selected = pickFromShuffledRound(allIds, courseId, 1, 0, count);
    }
  } else {
    // Random cycles: each full round uses a new shuffled order, next slice each test.
    selected = pickFromShuffledRound(allIds, courseId, roundIndex, offsetInRound, count);
  }

  if (shuffleQuestions) {
    return shuffleIds(selected);
  }

  return selected;
};

export const buildTestPayload = async (body, options = {}) => {
  const { excludeTestId, keepExistingQuestions = false } = options;
  const courseId = body.course || body.courseId;
  if (!courseId) {
    throw new Error("course is required");
  }

  const questionCount = Number(body.questionCount);
  if (!body.name?.trim()) {
    throw new Error("Test name is required");
  }

  const courseChanged =
    body._existingCourse && String(courseId) !== String(body._existingCourse);
  const countChanged =
    body._existingQuestionCount != null &&
    questionCount !== Number(body._existingQuestionCount);

  const shouldRepick =
    !keepExistingQuestions || !body.questions?.length || courseChanged || countChanged;

  const questions = shouldRepick
    ? await pickQuestionsFromCourse(
        courseId,
        questionCount,
        body.shuffleQuestions !== false,
        excludeTestId
      )
    : body.questions;

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
