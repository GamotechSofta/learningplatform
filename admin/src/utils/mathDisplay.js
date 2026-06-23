const LATEX_COMMAND_PATTERN =
  /\\(?:frac|sqrt|begin|end|text|ldots|gcd|theta|sin|cos|geq|leq|times|cdot|left|right|over|displaystyle|mathbb|quad|lambda|sum|int|lim|[a-zA-Z]+)/;

export const MATH_SEGMENT_REGEX =
  /(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\))/g;

export const coerceMathText = (children) => {
  if (children == null || children === false) return "";
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(coerceMathText).join("");
  }
  return String(children);
};

export const containsLatex = (text) => LATEX_COMMAND_PATTERN.test(String(text || ""));

export const needsDisplayMode = (tex) =>
  /\\begin\{(?:matrix|pmatrix|bmatrix|vmatrix|Vmatrix|align\*?|cases|array)/.test(tex) ||
  /\\\\/.test(tex) ||
  (/&/.test(tex) && /\\begin\{/.test(tex));

export const stripMathDelimiters = (value) => {
  const math = String(value || "").trim();
  if (math.startsWith("$$") && math.endsWith("$$")) {
    return { tex: math.slice(2, -2).trim(), displayMode: true };
  }
  if (math.startsWith("\\[") && math.endsWith("\\]")) {
    return { tex: math.slice(2, -2).trim(), displayMode: true };
  }
  if (math.startsWith("\\(") && math.endsWith("\\)")) {
    return { tex: math.slice(2, -2).trim(), displayMode: false };
  }
  if (math.startsWith("$") && math.endsWith("$")) {
    return { tex: math.slice(1, -1).trim(), displayMode: false };
  }
  return { tex: math, displayMode: false };
};

export const splitMathSegments = (input) => {
  const text = coerceMathText(input);
  if (!text) return [];

  const segments = [];
  let lastIndex = 0;

  for (const match of text.matchAll(MATH_SEGMENT_REGEX)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, index) });
    }
    segments.push({ type: "math", value: match[0] });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  if (!segments.length) {
    return [{ type: "text", value: text }];
  }

  const hasMath = segments.some((segment) => segment.type === "math");
  if (!hasMath && containsLatex(text)) {
    return [{ type: "math", value: text }];
  }

  return segments;
};

const extractAlignRowValue = (row) => {
  const cleaned = String(row || "")
    .replace(/\\end\{align\*?\}.*$/i, "")
    .replace(/\\\]\s*$/i, "")
    .trim();

  const labeled = cleaned.match(/\(\s*\d+\s*\)\s*&\s*(.+?)(?:\\\\)?\s*$/);
  if (labeled) return labeled[1].trim();

  const plain = cleaned.match(/^&\s*(.+?)(?:\\\\)?\s*$/);
  if (plain) return plain[1].trim();

  return cleaned;
};

export const prepareTestQuestion = (question = "", options = []) => {
  const questionText = String(question || "");
  const optionList = (options || []).map(String);

  const openAlignTail = /\\\[\s*\\begin\{align\*?\}\s*$/i.test(questionText.trim());
  const alignOptions = optionList.some((option) => /^&\s*/.test(option.trim()));

  if (openAlignTail && alignOptions) {
    const stem = questionText
      .replace(/\\\[\s*\\begin\{align\*?\}\s*$/i, "")
      .trim();
    const rows = optionList.map((option) =>
      option.replace(/\\end\{align\*?\}.*$/i, "").trim()
    );
    const mathBlock = `\\begin{align*}\n${rows.join("\n")}\n\\end{align*}`;
    const cleanedOptions = rows.map(extractAlignRowValue);

    return {
      questionText: stem,
      options: cleanedOptions,
      mathBlock,
    };
  }

  const embeddedAlign = questionText.match(
    /(\\\[\s*)?\\begin\{align\*?\}[\s\S]+?\\end\{align\*?\}(\s*\\\])?/i
  );

  if (embeddedAlign) {
    const alignBody = embeddedAlign[0];
    const extracted = [];
    for (const line of alignBody.split("\n")) {
      const match = line.match(/\(\s*(\d+)\s*\)\s*&\s*(.+?)(?:\\\\)?\s*$/);
      if (match) {
        extracted[Number(match[1]) - 1] = match[2].trim();
      }
    }

    const filled = extracted.filter(Boolean);
    if (filled.length >= 2 && filled.length >= optionList.length) {
      const stem = questionText.replace(embeddedAlign[0], "").trim();
      return {
        questionText: stem,
        options: filled,
        mathBlock: "",
      };
    }
  }

  return {
    questionText,
    options: optionList,
    mathBlock: "",
  };
};
