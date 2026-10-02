"use client";

import React from "react";

export function renderInlineBold(str: string): React.ReactNode[] {
  const parts = str.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={i}
          style={{
            background: "#f1f5f9",
            padding: "1px 5px",
            borderRadius: 4,
            fontSize: "0.9em",
            fontFamily: "monospace",
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export function FormattedSarthiAnswer({ text }: { text: string }) {
  if (!text) return null;
  const paragraphs = text.split(/\n\n+/);

  return (
    <div className="sarthi-formatted-response" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {paragraphs.map((para, pIdx) => {
        const lines = para.split("\n");
        const isList = lines.every((l) => /^\s*([*-]|\d+\.)\s+/.test(l));

        if (isList) {
          return (
            <ul key={pIdx} style={{ margin: "2px 0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "4px" }}>
              {lines.map((line, lIdx) => {
                const cleanLine = line.replace(/^\s*([*-]|\d+\.)\s+/, "");
                return (
                  <li key={lIdx} style={{ margin: "2px 0", lineHeight: 1.55 }}>
                    {renderInlineBold(cleanLine)}
                  </li>
                );
              })}
            </ul>
          );
        }

        return (
          <p key={pIdx} style={{ margin: 0, lineHeight: 1.6 }}>
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {lIdx > 0 && <br />}
                {renderInlineBold(line)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
