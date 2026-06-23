import { useEffect, useRef } from "react";

const TOOLBAR = [
  { cmd: "bold", label: "B", title: "Bold" },
  { cmd: "italic", label: "I", title: "Italic" },
  { cmd: "underline", label: "U", title: "Underline" },
  { cmd: "insertUnorderedList", label: "• List", title: "Bullet list" },
  { cmd: "insertOrderedList", label: "1. List", title: "Numbered list" },
];

export default function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (command) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML || "");
  };

  const insertLatex = () => {
    const latex = window.prompt("Enter LaTeX (without $ delimiters):", "x^2");
    if (!latex) return;
    document.execCommand("insertHTML", false, `<span class="math-latex">$${latex}$</span>&nbsp;`);
    onChange(editorRef.current?.innerHTML || "");
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 dark:border-slate-600">
      <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
        {TOOLBAR.map((item) => (
          <button
            key={item.cmd}
            type="button"
            title={item.title}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec(item.cmd)}
            className="rounded px-2 py-1 text-xs font-medium text-slate-700 hover:bg-white dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertLatex}
          className="rounded px-2 py-1 text-xs font-medium text-blue-700 hover:bg-white dark:text-blue-300 dark:hover:bg-slate-700"
        >
          LaTeX
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML || "")}
        data-placeholder={placeholder}
        className="min-h-32 px-3 py-2 text-sm outline-none dark:bg-slate-800 dark:text-slate-100 [&:empty]:before:text-slate-400 [&:empty]:before:content-[attr(data-placeholder)]"
      />
    </div>
  );
}
