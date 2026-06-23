import katex from "katex";
import "katex/dist/katex.min.css";

const MATH_REGEX =
  /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\))/g;

const stripDelimiters = (value) => {
  const math = value.trim();
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

const renderTex = (tex, displayMode) => {
  try {
    return katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
      strict: "ignore",
      trust: true,
    });
  } catch {
    return tex;
  }
};

const splitSegments = (text) => {
  const input = String(text ?? "");
  if (!input) return [];

  const segments = [];
  let lastIndex = 0;

  for (const match of input.matchAll(MATH_REGEX)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ type: "text", value: input.slice(lastIndex, index) });
    }
    segments.push({ type: "math", value: match[0] });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < input.length) {
    segments.push({ type: "text", value: input.slice(lastIndex) });
  }

  return segments.length ? segments : [{ type: "text", value: input }];
};

export default function MathText({ children, className = "", as: Tag = "div" }) {
  const segments = splitSegments(children);

  return (
    <Tag className={`math-content leading-7 text-slate-800 dark:text-slate-100 ${className}`}>
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          return (
            <span key={`text-${index}`} className="whitespace-pre-wrap">
              {segment.value}
            </span>
          );
        }

        const { tex, displayMode } = stripDelimiters(segment.value);
        return (
          <span
            key={`math-${index}`}
            className={displayMode ? "my-2 block overflow-x-auto" : "mx-0.5 inline-block align-middle"}
            dangerouslySetInnerHTML={{ __html: renderTex(tex, displayMode) }}
          />
        );
      })}
    </Tag>
  );
}
