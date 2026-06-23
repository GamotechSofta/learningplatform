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
    questionCount: doc.questions?.length || 0,
  };
};
