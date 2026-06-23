const OPTION_BLOCK_REGEX = /\(\s*(\d+)\s*\)\s*([\s\S]*?)(?=\n\s*\(\s*\d+\s*\)|$)/g;

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
  return match ? match[1] : cleaned;
};

export const inferDifficulty = (questionNumber) => {
  const number = Number(questionNumber) || 1;
  if (number <= 10) return "easy";
  if (number <= 20) return "medium";
  return "hard";
};

export const mapCsvRowToQuestion = (row) => {
  const questionText = row["Question Text"] || row.question || "";
  const { question, options } = parseQuestionText(questionText);
  const correctAnswer = normalizeCorrectAnswer(
    row["Correct Option "] || row["Correct Option"] || row.correctAnswer
  );

  return {
    uuid: (row.unique_id || row.uuid || "").trim() || undefined,
    questionNumber: Number(row["Question Number"] || row.questionNumber || 0),
    subject: (row.Subject || row.subject || "Mathematics").trim(),
    shift: (row["Shift Name"] || row.shift || "JEE Main 2025").trim(),
    question,
    options,
    correctAnswer,
    explanation: (row.explanation || "").trim(),
    difficulty: inferDifficulty(row["Question Number"] || row.questionNumber),
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
