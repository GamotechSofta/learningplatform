import katex from "katex";
import "katex/dist/katex.min.css";
import {
  coerceMathText,
  needsDisplayMode,
  splitMathSegments,
  stripMathDelimiters,
} from "../../utils/mathDisplay.js";

const renderTex = (tex, displayMode) => {
  const useDisplay = displayMode || needsDisplayMode(tex);

  try {
    const html = katex.renderToString(tex, {
      displayMode: useDisplay,
      throwOnError: false,
      strict: "ignore",
      trust: true,
    });

    if (html.includes("katex-error") && !useDisplay && needsDisplayMode(tex)) {
      return katex.renderToString(tex, {
        displayMode: true,
        throwOnError: false,
        strict: "ignore",
        trust: true,
      });
    }

    return html;
  } catch {
    return tex;
  }
};

export default function MathText({ children, className = "", as: Tag = "div" }) {
  const text = coerceMathText(children);
  const segments = splitMathSegments(text);

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

        const { tex, displayMode } = stripMathDelimiters(segment.value);
        const html = renderTex(tex, displayMode);

        return (
          <span
            key={`math-${index}`}
            className={
              displayMode || needsDisplayMode(tex)
                ? "my-2 block overflow-x-auto"
                : "mx-0.5 inline-block align-middle"
            }
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </Tag>
  );
}
