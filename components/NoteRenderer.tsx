import { ReactNode } from "react";

export interface TipTapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface TipTapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  text?: string;
  marks?: TipTapMark[];
}

function applyMarks(content: ReactNode, marks: TipTapMark[]): ReactNode {
  return marks.reduce((node, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong className="font-bold">{node}</strong>;
      case "italic":
        return <em className="italic">{node}</em>;
      case "code":
        return (
          <code className="bg-slate-100 text-slate-800 rounded px-1.5 py-0.5 text-[0.875em] font-mono">
            {node}
          </code>
        );
      case "strike":
        return <s className="line-through">{node}</s>;
      case "link": {
        const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : "#";
        return (
          <a href={href} className="text-indigo-600 underline hover:text-indigo-800" target="_blank" rel="noopener noreferrer">
            {node}
          </a>
        );
      }
      default:
        return node;
    }
  }, content);
}

function renderNode(node: TipTapNode, key: number | string): ReactNode {
  const children = node.content?.map((child, i) => renderNode(child, i));

  switch (node.type) {
    case "doc":
      return <>{children}</>;

    case "paragraph":
      return (
        <p key={key} className="my-2 leading-relaxed text-gray-800">
          {children ?? <br />}
        </p>
      );

    case "heading": {
      const level = typeof node.attrs?.level === "number" ? node.attrs.level : 1;
      const styles: Record<number, string> = {
        1: "text-3xl font-bold mt-8 mb-3 text-gray-900",
        2: "text-2xl font-bold mt-6 mb-2 text-gray-900",
        3: "text-xl font-semibold mt-5 mb-2 text-gray-800",
      };
      const className = styles[level] ?? styles[1];
      if (level === 1) return <h1 key={key} className={className}>{children}</h1>;
      if (level === 2) return <h2 key={key} className={className}>{children}</h2>;
      return <h3 key={key} className={className}>{children}</h3>;
    }

    case "text": {
      const text = node.text ?? "";
      if (!node.marks || node.marks.length === 0) return text;
      return <span key={key}>{applyMarks(text, node.marks)}</span>;
    }

    case "bulletList":
      return (
        <ul key={key} className="list-disc pl-6 my-3 space-y-1">
          {children}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={key} className="list-decimal pl-6 my-3 space-y-1">
          {children}
        </ol>
      );

    case "listItem":
      return (
        <li key={key} className="text-gray-800 leading-relaxed pl-1">
          {children}
        </li>
      );

    case "codeBlock":
      return (
        <pre
          key={key}
          className="bg-slate-800 text-slate-100 rounded-lg p-4 my-4 overflow-x-auto text-sm font-mono leading-relaxed"
        >
          <code>{children}</code>
        </pre>
      );

    case "blockquote":
      return (
        <blockquote
          key={key}
          className="border-l-4 border-indigo-300 pl-4 my-4 text-gray-600 italic"
        >
          {children}
        </blockquote>
      );

    case "hardBreak":
      return <br key={key} />;

    case "horizontalRule":
      return <hr key={key} className="border-t-2 border-gray-200 my-6" />;

    default:
      return <>{children}</>;
  }
}

interface NoteRendererProps {
  doc: TipTapNode;
}

export default function NoteRenderer({ doc }: NoteRendererProps) {
  return (
    <div className="text-base">
      {doc.content?.map((node, i) => renderNode(node, i))}
    </div>
  );
}
