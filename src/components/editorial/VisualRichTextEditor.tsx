"use client";

import { useRef, useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function VisualRichTextEditor({
  value,
  onChange,
  placeholder = "Write the article story here...",
  minHeight = 220,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync value from props only if content differs significantly to prevent cursor jumping
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (!editorRef.current.matches(":focus")) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value]);

  const exec = (command: string, arg: string | undefined = undefined) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePromptLink = () => {
    const url = prompt("Enter web link URL:", "https://");
    if (url) {
      exec("createLink", url);
    }
  };

  return (
    <div
      style={{
        borderRadius: 8,
        border: "1px solid var(--border-color)",
        background: "rgba(255, 255, 255, 0.02)",
        overflow: "hidden",
      }}
    >
      {/* Visual Toolbar - Plain English formatting, NO HTML tags */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 4,
          padding: "8px 12px",
          background: "rgba(255, 255, 255, 0.04)",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <button
          type="button"
          onClick={() => exec("bold")}
          title="Bold (Ctrl+B)"
          style={{
            padding: "5px 10px",
            borderRadius: 6,
            border: "1px solid var(--border-color)",
            background: "transparent",
            color: "var(--foreground)",
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => exec("italic")}
          title="Italic (Ctrl+I)"
          style={{
            padding: "5px 10px",
            borderRadius: 6,
            border: "1px solid var(--border-color)",
            background: "transparent",
            color: "var(--foreground)",
            fontStyle: "italic",
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => exec("underline")}
          title="Underline (Ctrl+U)"
          style={{
            padding: "5px 10px",
            borderRadius: 6,
            border: "1px solid var(--border-color)",
            background: "transparent",
            color: "var(--foreground)",
            textDecoration: "underline",
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          U
        </button>

        <span style={{ width: 1, height: 18, background: "var(--border-color)", margin: "0 4px" }} />

        <button
          type="button"
          onClick={() => exec("formatBlock", "<h3>")}
          title="Subheading"
          style={{
            padding: "5px 9px",
            borderRadius: 6,
            border: "1px solid var(--border-color)",
            background: "transparent",
            color: "var(--foreground)",
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Heading
        </button>

        <button
          type="button"
          onClick={() => exec("formatBlock", "<p>")}
          title="Normal Paragraph"
          style={{
            padding: "5px 9px",
            borderRadius: 6,
            border: "1px solid var(--border-color)",
            background: "transparent",
            color: "var(--foreground)",
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          Normal Text
        </button>

        <span style={{ width: 1, height: 18, background: "var(--border-color)", margin: "0 4px" }} />

        <button
          type="button"
          onClick={() => exec("insertUnorderedList")}
          title="Bullet Points"
          style={{
            padding: "5px 9px",
            borderRadius: 6,
            border: "1px solid var(--border-color)",
            background: "transparent",
            color: "var(--foreground)",
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          • Bullets
        </button>

        <button
          type="button"
          onClick={() => exec("insertOrderedList")}
          title="Numbered List"
          style={{
            padding: "5px 9px",
            borderRadius: 6,
            border: "1px solid var(--border-color)",
            background: "transparent",
            color: "var(--foreground)",
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          1. Numbered
        </button>

        <button
          type="button"
          onClick={() => exec("formatBlock", "<blockquote>")}
          title="Quote Block"
          style={{
            padding: "5px 9px",
            borderRadius: 6,
            border: "1px solid var(--border-color)",
            background: "transparent",
            color: "var(--foreground)",
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          &ldquo; Quote
        </button>

        <button
          type="button"
          onClick={handlePromptLink}
          title="Insert Link"
          style={{
            padding: "5px 9px",
            borderRadius: 6,
            border: "1px solid var(--border-color)",
            background: "transparent",
            color: "var(--foreground)",
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          🔗 Link
        </button>

        <span style={{ width: 1, height: 18, background: "var(--border-color)", margin: "0 4px" }} />

        <button
          type="button"
          onClick={() => exec("undo")}
          title="Undo (Ctrl+Z)"
          style={{
            padding: "5px 9px",
            borderRadius: 6,
            border: "1px solid var(--border-color)",
            background: "transparent",
            color: "var(--muted)",
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          ↺ Undo
        </button>
        <button
          type="button"
          onClick={() => exec("redo")}
          title="Redo (Ctrl+Y)"
          style={{
            padding: "5px 9px",
            borderRadius: 6,
            border: "1px solid var(--border-color)",
            background: "transparent",
            color: "var(--muted)",
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          ↻ Redo
        </button>
      </div>

      {/* Visual Content Editable Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        style={{
          minHeight,
          padding: "16px",
          color: "var(--foreground)",
          fontSize: "0.95rem",
          lineHeight: 1.6,
          outline: "none",
          overflowY: "auto",
        }}
        data-placeholder={placeholder}
      />
    </div>
  );
}

