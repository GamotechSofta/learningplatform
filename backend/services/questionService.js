import axios from "axios";
import { parse } from "csv-parse/sync";
import Course from "../models/course.js";
import Question from "../models/question.js";
import QuestionVersion from "../models/questionVersion.js";
import {
  mapCsvRowToQuestion,
  mapStandardCsvRow,
  normalizeQuestionPayload,
  normalizeQuestionText,
  validateCsvColumns,
  validateCsvRow,
} from "../utils/questionParser.js";

export const JEE_MATH_CSV_URL =
  "https://huggingface.co/datasets/CK0607/2025-Jee-Mains-Question/resolve/main/math_with_uuid.csv";

export const downloadCsv = async (url = JEE_MATH_CSV_URL) => {
  const response = await axios.get(url, {
    responseType: "text",
    timeout: 120000,
  });
  return response.data;
};

export const parseCsvContent = (csvText) =>
  parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  });

const activeFilter = { isDeleted: { $ne: true } };

const courseResolveCache = new Map();

export const resolveCourseId = async (courseName, fallbackId) => {
  const name = String(courseName || "").trim();
  if (!name) return fallbackId || null;

  const cacheKey = name.toLowerCase();
  if (courseResolveCache.has(cacheKey)) {
    return courseResolveCache.get(cacheKey);
  }

  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const course = await Course.findOne({
    title: new RegExp(`^${escaped}$`, "i"),
  });

  if (!course) {
    throw new Error(`Course not found: ${name}`);
  }

  courseResolveCache.set(cacheKey, course._id);
  return course._id;
};

const duplicateKey = (item, courseId) => {
  const text = typeof item === "string" ? item : item?.question || "";
  const subject = typeof item === "string" ? "" : item?.subject || "";
  const chapter = typeof item === "string" ? "" : item?.chapter || "";
  return `${normalizeQuestionText(text)}|${String(subject).toLowerCase()}|${String(chapter).toLowerCase()}|${courseId || ""}`;
};

export const buildQuestionQuery = (query = {}) => {
  const filter = {};

  if (query.course) {
    filter.course = query.course;
  }

  if (query.includeDeleted === "true") {
    filter.isDeleted = true;
  } else if (query.includeDeleted !== "all") {
    filter.isDeleted = { $ne: true };
  }

  if (query.status?.trim()) {
    filter.status = query.status.trim();
  }

  if (query.subject?.trim()) {
    filter.subject = new RegExp(`^${query.subject.trim()}$`, "i");
  }

  if (query.chapter?.trim()) {
    filter.chapter = new RegExp(query.chapter.trim(), "i");
  }

  if (query.shift?.trim()) {
    filter.shift = new RegExp(query.shift.trim(), "i");
  }

  if (query.year) {
    filter.year = Number(query.year);
  }

  if (query.difficulty?.trim()) {
    filter.difficulty = query.difficulty.trim().toLowerCase();
  }

  if (query.questionNumber) {
    filter.questionNumber = Number(query.questionNumber);
  }

  if (query.tags?.trim()) {
    filter.tags = { $in: query.tags.split(",").map((t) => t.trim()).filter(Boolean) };
  }

  if (query.q?.trim()) {
    const term = query.q.trim();
    filter.$or = [
      { question: new RegExp(term, "i") },
      { subject: new RegExp(term, "i") },
      { chapter: new RegExp(term, "i") },
      { shift: new RegExp(term, "i") },
      { tags: new RegExp(term, "i") },
    ];
  }

  return filter;
};

export const getSortOption = (sort = "latest") => {
  if (sort === "oldest") return { createdAt: 1 };
  return { createdAt: -1 };
};

export const previewCsvImport = async (csvText, courseId) => {
  const rows = parseCsvContent(csvText);
  const columnCheck = validateCsvColumns(rows);

  const seenInFile = new Map();
  const validRows = [];
  const invalidRows = [];
  const duplicateRows = [];

  const existingFilter = { ...activeFilter };
  if (courseId) existingFilter.course = courseId;

  const existingQuestions = await Question.find(existingFilter)
    .select("question subject chapter course")
    .lean();
  const existingKeys = new Set(
    existingQuestions.map((q) =>
      duplicateKey(q, q.course?.toString() || courseId)
    )
  );

  rows.forEach((row, index) => {
    const payload = row.Question || row.Option1 ? mapStandardCsvRow(row, index) : mapCsvRowToQuestion(row);
    const errors = validateCsvRow(payload);
    const key = duplicateKey(payload, courseId);

    const rowResult = { ...payload, errors };

    if (errors.length) {
      invalidRows.push(rowResult);
      return;
    }

    if (seenInFile.has(key)) {
      duplicateRows.push({ ...rowResult, duplicateType: "file", duplicateOf: seenInFile.get(key) });
      return;
    }

    seenInFile.set(key, payload.rowIndex || index + 1);

    if (existingKeys.has(key)) {
      duplicateRows.push({ ...rowResult, duplicateType: "database" });
      return;
    }

    validRows.push(rowResult);
  });

  return {
    totalRows: rows.length,
    columnCheck,
    validCount: validRows.length,
    invalidCount: invalidRows.length,
    duplicateCount: duplicateRows.length,
    preview: validRows.slice(0, 10),
    invalidRows: invalidRows.slice(0, 20),
    duplicateRows: duplicateRows.slice(0, 20),
    validRows,
  };
};

export const importQuestionsFromCsv = async ({
  csvText,
  url = JEE_MATH_CSV_URL,
  clearExisting = false,
  skipDuplicates = true,
  courseId,
} = {}) => {
  const content = csvText || (await downloadCsv(url));
  const preview = await previewCsvImport(content, courseId);
  const rows = preview.validRows.length
    ? preview.validRows
    : parseCsvContent(content).map((row, i) =>
        row.Question || row.Option1 ? mapStandardCsvRow(row, i) : mapCsvRowToQuestion(row)
      );

  if (clearExisting && courseId) {
    await Question.updateMany(
      { course: courseId },
      { isDeleted: true, deletedAt: new Date() }
    );
  }

  const stats = {
    totalRows: preview.totalRows || rows.length,
    imported: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    success: [],
    failedRecords: [],
    errors: [],
  };

  for (const payload of rows) {
    try {
      const errors = validateCsvRow(payload);
      if (errors.length) {
        stats.failed += 1;
        stats.failedRecords.push({ rowIndex: payload.rowIndex, errors, payload });
        continue;
      }

      const resolvedCourseId = await resolveCourseId(payload.courseName, courseId);

      const key = duplicateKey(payload, resolvedCourseId);

      const filter = payload.uuid
        ? { uuid: payload.uuid }
        : {
            ...(resolvedCourseId ? { course: resolvedCourseId } : {}),
            question: payload.question,
            subject: payload.subject,
            chapter: payload.chapter || "",
            isDeleted: { $ne: true },
          };

      const existing = await Question.findOne(filter);

      if (existing && skipDuplicates && !payload.uuid) {
        const existingKey = duplicateKey(existing, resolvedCourseId);
        if (existingKey === key) {
          stats.skipped += 1;
          continue;
        }
      }

      const data = {
        ...(resolvedCourseId ? { course: resolvedCourseId } : {}),
        question: payload.question,
        options: payload.options,
        correctAnswer: payload.correctAnswer,
        subject: payload.subject,
        chapter: payload.chapter || "",
        difficulty: payload.difficulty,
        explanation: payload.explanation || "",
        year: payload.year,
        shift: payload.shift || "",
        tags: payload.tags || [],
        image: payload.image || "",
        questionNumber: payload.questionNumber,
        uuid: payload.uuid,
        status: "active",
        isDeleted: false,
        deletedAt: null,
      };

      if (existing) {
        Object.assign(existing, data);
        await existing.save();
        stats.updated += 1;
        stats.success.push({ rowIndex: payload.rowIndex, id: existing._id, action: "updated" });
      } else {
        const created = await Question.create(data);
        stats.imported += 1;
        stats.success.push({ rowIndex: payload.rowIndex, id: created._id, action: "imported" });
      }
    } catch (error) {
      stats.failed += 1;
      stats.errors.push(error.message);
      stats.failedRecords.push({
        rowIndex: payload.rowIndex,
        errors: [error.message],
        payload,
      });
    }
  }

  return stats;
};

export const getQuestionStats = async (courseId) => {
  const baseMatch = { isDeleted: { $ne: true } };
  if (courseId) baseMatch.course = courseId;

  const [total, subjectStats, chapterStats, difficultyStats, yearStats] = await Promise.all([
    Question.countDocuments(baseMatch),
    Question.aggregate([
      { $match: baseMatch },
      { $group: { _id: "$subject", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Question.aggregate([
      { $match: { ...baseMatch, chapter: { $ne: "" } } },
      { $group: { _id: { subject: "$subject", chapter: "$chapter" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]),
    Question.aggregate([
      { $match: baseMatch },
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Question.aggregate([
      { $match: { ...baseMatch, year: { $exists: true, $ne: null } } },
      { $group: { _id: "$year", count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]),
  ]);

  return {
    total,
    deleted: await Question.countDocuments({ isDeleted: true }),
    bySubject: subjectStats.map((item) => ({
      subject: item._id,
      count: item.count,
    })),
    byChapter: chapterStats.map((item) => ({
      subject: item._id.subject,
      chapter: item._id.chapter,
      count: item.count,
    })),
    byDifficulty: difficultyStats.map((item) => ({
      difficulty: item._id,
      count: item.count,
    })),
    byYear: yearStats.map((item) => ({
      year: item._id,
      count: item.count,
    })),
  };
};

export const findDuplicateQuestions = async (courseId) => {
  const match = { ...activeFilter };
  if (courseId) match.course = courseId;

  const duplicates = await Question.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          question: { $toLower: { $trim: { input: "$question" } } },
          subject: { $toLower: "$subject" },
          chapter: { $toLower: { $ifNull: ["$chapter", ""] } },
          course: "$course",
        },
        count: { $sum: 1 },
        ids: { $push: "$_id" },
      },
    },
    { $match: { count: { $gt: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 100 },
  ]);

  return duplicates.map((item) => ({
    question: item._id.question,
    subject: item._id.subject,
    chapter: item._id.chapter,
    count: item.count,
    ids: item.ids,
  }));
};

export const saveQuestionVersion = async (question, userId, changeNote = "") => {
  const snapshot =
    typeof question.toObject === "function" ? question.toObject() : { ...question };

  await QuestionVersion.create({
    questionId: question._id,
    version: question.version || 1,
    snapshot,
    changedBy: userId,
    changeNote,
  });
};

export const exportQuestions = async (query = {}) => {
  const filter = buildQuestionQuery(query);
  return Question.find(filter).sort(getSortOption(query.sort)).lean();
};

export const questionsToCsv = (questions) => {
  const headers = [
    "Question",
    "Option1",
    "Option2",
    "Option3",
    "Option4",
    "CorrectAnswer",
    "Subject",
    "Chapter",
    "Difficulty",
    "Explanation",
    "Year",
    "Tags",
    "Image",
  ];

  const escape = (value) => {
    const str = String(value ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = questions.map((q) =>
    [
      q.question,
      q.options[0] || "",
      q.options[1] || "",
      q.options[2] || "",
      q.options[3] || "",
      q.correctAnswer,
      q.subject,
      q.chapter || "",
      q.difficulty,
      q.explanation || "",
      q.year || "",
      (q.tags || []).join(";"),
      q.image || "",
    ]
      .map(escape)
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
};
