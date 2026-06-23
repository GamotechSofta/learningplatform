import axios from "axios";
import { parse } from "csv-parse/sync";
import Question from "../models/question.js";
import { mapCsvRowToQuestion } from "../utils/questionParser.js";

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

export const importQuestionsFromCsv = async ({
  csvText,
  url = JEE_MATH_CSV_URL,
  clearExisting = false,
} = {}) => {
  const content = csvText || (await downloadCsv(url));
  const rows = parseCsvContent(content);

  if (clearExisting) {
    await Question.deleteMany({ subject: "Mathematics" });
  }

  const stats = {
    totalRows: rows.length,
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  for (const row of rows) {
    try {
      const payload = mapCsvRowToQuestion(row);

      if (!payload.question || payload.options.length < 2 || !payload.correctAnswer) {
        stats.skipped += 1;
        continue;
      }

      const filter = payload.uuid
        ? { uuid: payload.uuid }
        : {
            subject: payload.subject,
            shift: payload.shift,
            questionNumber: payload.questionNumber,
          };

      const existing = await Question.findOne(filter);

      if (existing) {
        Object.assign(existing, payload);
        await existing.save();
        stats.updated += 1;
      } else {
        await Question.create(payload);
        stats.imported += 1;
      }
    } catch (error) {
      stats.skipped += 1;
      stats.errors.push(error.message);
    }
  }

  return stats;
};

export const getQuestionStats = async () => {
  const [total, subjectStats, shiftStats, difficultyStats] = await Promise.all([
    Question.countDocuments(),
    Question.aggregate([
      { $group: { _id: "$subject", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Question.aggregate([
      { $group: { _id: "$shift", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    Question.aggregate([
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    total,
    bySubject: subjectStats.map((item) => ({
      subject: item._id,
      count: item.count,
    })),
    byShift: shiftStats.map((item) => ({
      shift: item._id,
      count: item.count,
    })),
    byDifficulty: difficultyStats.map((item) => ({
      difficulty: item._id,
      count: item.count,
    })),
  };
};

export const buildQuestionQuery = (query = {}) => {
  const filter = {};

  if (query.subject?.trim()) {
    filter.subject = new RegExp(`^${query.subject.trim()}$`, "i");
  }

  if (query.shift?.trim()) {
    filter.shift = new RegExp(query.shift.trim(), "i");
  }

  if (query.difficulty?.trim()) {
    filter.difficulty = query.difficulty.trim().toLowerCase();
  }

  if (query.questionNumber) {
    filter.questionNumber = Number(query.questionNumber);
  }

  if (query.q?.trim()) {
    const term = query.q.trim();
    filter.$or = [
      { $text: { $search: term } },
      { question: new RegExp(term, "i") },
      { subject: new RegExp(term, "i") },
      { shift: new RegExp(term, "i") },
    ];
  }

  return filter;
};
