const OPTION_BLOCK_REGEX = /\(\s*(\d+)\s*\)\s*([\s\S]*?)(?=\n\s*\(\s*\d+\s*\)|$)/g;

export const REQUIRED_CSV_COLUMNS = [
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
];

export const normalizeQuestionText = (text = "") =>
  String(text).replace(/\s+/g, " ").trim().toLowerCase();

export const parseQuestionText = (rawText = "") => {
  const text = String(rawText).replace(/\r\n/g, "\n").trim();
  const firstOptionIndex = text.search(/\(\s*1\s*\)/);

  if (firstOptionIndex === -1) {
    return { question: text, options: [] };
  }

  const question = text.slice(0, firstOptionIndex).trim();
  const optionsPart = text.slice(firstOptionIndex);
  const optionsMap = new Map();

  for (const match of optionsPart.matchAll(OPTION_BLOCK_REGEX)) {
    const label = Number(match[1]);
    const optionText = match[2].replace(/\s+/g, " ").trim();
    if (label > 0 && optionText) {
      optionsMap.set(label, optionText);
    }
  }

  const options = [...optionsMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, value]) => value);

  return { question, options };
};

export const normalizeCorrectAnswer = (value) => {
  const cleaned = String(value ?? "").trim();
  const match = cleaned.match(/^(\d+)/);
  return match ? Number(match[1]) : Number(cleaned) || 1;
};

export const normalizeDifficulty = (value) => {
  const cleaned = String(value || "medium").trim().toLowerCase();
  if (["easy", "medium", "hard"].includes(cleaned)) return cleaned;
  return "medium";
};

export const inferDifficulty = (questionNumber) => {
  const number = Number(questionNumber) || 1;
  if (number <= 10) return "easy";
  if (number <= 20) return "medium";
  return "hard";
};

export const inferYear = (shift = "", explicitYear) => {
  if (explicitYear) return Number(explicitYear);
  const match = String(shift).match(/(20\d{2})/);
  return match ? Number(match[1]) : undefined;
};

export const mapStandardCsvRow = (row, rowIndex = 0) => {
  const question = (row.Question || row.question || "").trim();
  const options = [
    row.Option1 || row.option1,
    row.Option2 || row.option2,
    row.Option3 || row.option3,
    row.Option4 || row.option4,
  ]
    .map((opt) => String(opt || "").trim())
    .filter(Boolean);

  const correctAnswer = normalizeCorrectAnswer(
    row.CorrectAnswer || row.correctAnswer || row["Correct Answer"]
  );

  const subject = (row.Subject || row.subject || "").trim();
  const chapter = (row.Chapter || row.chapter || "").trim();
  const difficulty = normalizeDifficulty(row.Difficulty || row.difficulty);
  const explanation = (row.Explanation || row.explanation || "").trim();
  const year = inferYear(row.Shift || row.shift, row.Year || row.year);
  const tags = String(row.Tags || row.tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return {
    rowIndex: rowIndex + 1,
    question,
    options,
    correctAnswer,
    subject,
    chapter,
    difficulty,
    explanation,
    year,
    tags,
    shift: (row.Shift || row.shift || "").trim(),
    image: (row.Image || row.image || "").trim(),
    status: "active",
  };
};

export const validateCsvRow = (payload) => {
  const errors = [];

  if (!payload.question) errors.push("Question is required");
  if (payload.options.length < 2) errors.push("At least 2 options required");
  if (!payload.subject) errors.push("Subject is required");
  if (!payload.correctAnswer || payload.correctAnswer < 1) {
    errors.push("Valid CorrectAnswer is required");
  }
  if (payload.correctAnswer > payload.options.length) {
    errors.push("CorrectAnswer exceeds option count");
  }

  return errors;
};

export const validateCsvColumns = (rows) => {
  if (!rows.length) {
    return { valid: false, missing: REQUIRED_CSV_COLUMNS, message: "CSV is empty" };
  }

  const headers = Object.keys(rows[0]);
  const normalizedHeaders = new Set(headers.map((h) => h.trim()));
  const missing = REQUIRED_CSV_COLUMNS.filter((col) => !normalizedHeaders.has(col));

  return {
    valid: missing.length === 0,
    missing,
    headers,
    message:
      missing.length === 0
        ? "All required columns present"
        : `Missing columns: ${missing.join(", ")}`,
  };
};

export const mapCsvRowToQuestion = (row) => {
  if (row.Question || row.Option1) {
    const payload = mapStandardCsvRow(row);
    return {
      ...payload,
      questionNumber: Number(row["Question Number"] || row.questionNumber || 0) || undefined,
      uuid: (row.unique_id || row.uuid || "").trim() || undefined,
    };
  }

  const questionText = row["Question Text"] || row.question || "";
  const { question, options } = parseQuestionText(questionText);
  const correctAnswer = normalizeCorrectAnswer(
    row["Correct Option "] || row["Correct Option"] || row.correctAnswer
  );

  return {
    uuid: (row.unique_id || row.uuid || "").trim() || undefined,
    questionNumber: Number(row["Question Number"] || row.questionNumber || 0) || undefined,
    subject: (row.Subject || row.subject || "Mathematics").trim(),
    shift: (row["Shift Name"] || row.shift || "JEE Main 2025").trim(),
    year: inferYear(row["Shift Name"] || row.shift, row.Year || row.year),
    chapter: (row.Chapter || row.chapter || "").trim(),
    question,
    options,
    correctAnswer,
    explanation: (row.explanation || row.Explanation || "").trim(),
    difficulty: normalizeDifficulty(
      row.Difficulty || row.difficulty || inferDifficulty(row["Question Number"])
    ),
    status: "active",
  };
};

export const sanitizeQuestionForTest = (questionDoc) => {
  const doc =
    typeof questionDoc.toObject === "function"
      ? questionDoc.toObject()
      : { ...questionDoc };

  delete doc.correctAnswer;
  delete doc.explanation;
  return doc;
};

export const normalizeQuestionPayload = (body = {}) => {
  const options = (body.options || []).map((opt) => String(opt).trim()).filter(Boolean);
  const image = body.image || body.imageUrl || "";

  return {
    uuid: body.uuid,
    questionNumber: body.questionNumber ? Number(body.questionNumber) : undefined,
    subject: body.subject?.trim(),
    shift: body.shift?.trim() || "",
    year: body.year ? Number(body.year) : inferYear(body.shift, body.year),
    chapter: body.chapter?.trim() || "",
    question: body.question?.trim(),
    options,
    correctAnswer: normalizeCorrectAnswer(body.correctAnswer),
    explanation: body.explanation?.trim() || "",
    difficulty: normalizeDifficulty(body.difficulty),
    image,
    tags: Array.isArray(body.tags)
      ? body.tags.map((t) => String(t).trim()).filter(Boolean)
      : String(body.tags || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
    questionType: body.questionType || (image ? "image" : "text"),
    status: body.status || "active",
    course: body.course || body.courseId || undefined,
  };
};
