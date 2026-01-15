import React from "react";

export default function CodeEditor({ value = "", onChange }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder="Write your code here..."
      style={{
        width: "100%",
        minHeight: "220px",
        padding: "12px",
        borderRadius: "10px",
        border: "1px solid #444",
        background: "#0f172a",
        color: "#e5e7eb",
        fontFamily: "monospace",
        fontSize: "14px",
      }}
    />
  );
}
