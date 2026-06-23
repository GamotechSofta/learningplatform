import Test from "../models/test.js";
import asyncHandler from "../middleware/asyncHandler.js";
import {
  buildTestQuery,
  buildTestPayload,
  getTestDashboardStats,
  serializeTest,
} from "../services/testService.js";

const getPagination = (query) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await getTestDashboardStats();
  res.json({ success: true, data: stats });
});

export const getTests = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildTestQuery(req.query);

  const [tests, total] = await Promise.all([
    Test.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("questions", "questionNumber subject")
      .lean(),
    Test.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: tests.length,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    data: tests.map((test) => ({
      ...test,
      questionCount: test.questions?.length || 0,
    })),
  });
});

export const getTestById = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.id).populate(
    "questions",
    "questionNumber subject shift difficulty question"
  );

  if (!test) {
    res.status(404);
    throw new Error("Test not found");
  }

  res.json({ success: true, data: serializeTest(test) });
});

export const createTest = asyncHandler(async (req, res) => {
  const payload = await buildTestPayload({
    ...req.body,
    course: req.body.course || req.body.courseId,
  });

  const test = await Test.create({
    ...payload,
    createdBy: req.user?._id,
  });

  res.status(201).json({ success: true, data: serializeTest(test) });
});

export const updateTest = asyncHandler(async (req, res) => {
  const existing = await Test.findById(req.params.id);
  if (!existing) {
    res.status(404);
    throw new Error("Test not found");
  }

  const payload = await buildTestPayload(
    {
      ...existing.toObject(),
      ...req.body,
      course: req.body.course || req.body.courseId || existing.course,
      _existingCourse: existing.course,
      _existingQuestionCount: existing.questionCount,
    },
    {
      excludeTestId: existing._id,
      keepExistingQuestions: true,
    }
  );

  const test = await Test.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: serializeTest(test) });
});

export const deleteTest = asyncHandler(async (req, res) => {
  const test = await Test.findByIdAndDelete(req.params.id);
  if (!test) {
    res.status(404);
    throw new Error("Test not found");
  }

  res.json({ success: true, message: "Test deleted" });
});

export const cloneTest = asyncHandler(async (req, res) => {
  const source = await Test.findById(req.params.id).lean();
  if (!source) {
    res.status(404);
    throw new Error("Test not found");
  }

  const { _id, createdAt, updatedAt, publishedAt, ...rest } = source;
  const clone = await Test.create({
    ...rest,
    name: `${source.name} (Copy)`,
    status: "draft",
    publishedAt: null,
    clonedFrom: _id,
    createdBy: req.user?._id,
  });

  res.status(201).json({ success: true, data: serializeTest(clone) });
});

export const publishTest = asyncHandler(async (req, res) => {
  const test = await Test.findByIdAndUpdate(
    req.params.id,
    { status: "published", publishedAt: new Date() },
    { new: true, runValidators: true }
  );

  if (!test) {
    res.status(404);
    throw new Error("Test not found");
  }

  res.json({ success: true, data: serializeTest(test) });
});

export const unpublishTest = asyncHandler(async (req, res) => {
  const test = await Test.findByIdAndUpdate(
    req.params.id,
    { status: "unpublished" },
    { new: true, runValidators: true }
  );

  if (!test) {
    res.status(404);
    throw new Error("Test not found");
  }

  res.json({ success: true, data: serializeTest(test) });
});

export const scheduleTest = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    res.status(400);
    throw new Error("startDate and endDate are required");
  }

  const test = await Test.findByIdAndUpdate(
    req.params.id,
    {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: "scheduled",
    },
    { new: true, runValidators: true }
  );

  if (!test) {
    res.status(404);
    throw new Error("Test not found");
  }

  res.json({ success: true, data: serializeTest(test) });
});
