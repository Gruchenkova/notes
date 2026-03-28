"use client";

import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface NoteEditorProps {
  onChange?: (json: object) => void;
  initialContent?: object | null;
}

// ── Icons ────────────────────────────────────────────────────────────────────

function IconBold() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden="true">
      <path d="M4 2h4.5a3 3 0 0 1 2.2 5A3.25 3.25 0 0 1 8.75 14H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm1.5 5h3a1.5 1.5 0 0 0 0-3H5.5v3zm0 4.5h3.25a1.75 1.75 0 0 0 0-3.5H5.5v3.5z" />
    </svg>
  );
}

function IconItalic() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden="true">
      <path d="M7 2h5a.75.75 0 0 1 0 1.5h-2L7.5 12.5H9.5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1 0-1.5h2L9 3.5H7A.75.75 0 0 1 7 2z" />
    </svg>
  );
}

function IconBulletList() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden="true">
      <circle cx="2" cy="4" r="1.25" />
      <rect x="5" y="3.25" width="9" height="1.5" rx=".75" />
      <circle cx="2" cy="8" r="1.25" />
      <rect x="5" y="7.25" width="9" height="1.5" rx=".75" />
      <circle cx="2" cy="12" r="1.25" />
      <rect x="5" y="11.25" width="9" height="1.5" rx=".75" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 4 1 8l4 4M11 4l4 4-4 4" />
    </svg>
  );
}

function IconCodeBlock() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" aria-hidden="true">
      <rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 6 3 8l2 2M11 6l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconHorizontalRule() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden="true">
      <rect x="1" y="7.25" width="14" height="1.5" rx=".75" />
    </svg>
  );
}

function IconParagraph() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden="true">
      <path d="M9 2H5.5a3.5 3.5 0 0 0 0 7H8v5h1.5V2H11V2H9zm0 5.5H5.5a2 2 0 0 1 0-4H9v4z" />
    </svg>
  );
}

// ── Toolbar button ────────────────────────────────────────────────────────────

type ToolbarButtonProps = {
  onClick: () => void;
  isActive: boolean;
  label: string;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, isActive, label, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={isActive}
      title={label}
      className={`flex items-center justify-center w-8 h-8 rounded transition-colors ${
        isActive
          ? "bg-indigo-100 text-indigo-700"
          : "text-gray-500 hover:bg-gray-200 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <span className="w-px self-stretch bg-gray-200 mx-0.5" aria-hidden="true" />;
}

// ── Editor ────────────────────────────────────────────────────────────────────

export default function NoteEditor({ onChange, initialContent }: NoteEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
    ],
    content: initialContent ?? "<p></p>",
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange?.(editor.getJSON());
    },
  });

  const state = useEditorState({
    editor,
    selector: (ctx) => ({
      isParagraph: ctx.editor?.isActive("paragraph") ?? false,
      isH1: ctx.editor?.isActive("heading", { level: 1 }) ?? false,
      isH2: ctx.editor?.isActive("heading", { level: 2 }) ?? false,
      isH3: ctx.editor?.isActive("heading", { level: 3 }) ?? false,
      isBold: ctx.editor?.isActive("bold") ?? false,
      isItalic: ctx.editor?.isActive("italic") ?? false,
      isBulletList: ctx.editor?.isActive("bulletList") ?? false,
      isCode: ctx.editor?.isActive("code") ?? false,
      isCodeBlock: ctx.editor?.isActive("codeBlock") ?? false,
    }),
  });

  const s = state ?? {
    isParagraph: false, isH1: false, isH2: false, isH3: false,
    isBold: false, isItalic: false, isBulletList: false,
    isCode: false, isCodeBlock: false,
  };

  return (
    <div className="rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
      {/* Toolbar */}
      <div
        role="toolbar"
        aria-label="Text formatting"
        className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200"
      >
        {/* Text structure */}
        <ToolbarButton
          onClick={() => editor?.chain().focus().setParagraph().run()}
          isActive={s.isParagraph}
          label="Paragraph"
        >
          <IconParagraph />
        </ToolbarButton>
        {([1, 2, 3] as const).map((level) => (
          <ToolbarButton
            key={level}
            onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}
            isActive={[s.isH1, s.isH2, s.isH3][level - 1]}
            label={`Heading ${level}`}
          >
            <span className="text-xs font-bold leading-none">H{level}</span>
          </ToolbarButton>
        ))}

        <Separator />

        {/* Emphasis */}
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          isActive={s.isBold}
          label="Bold (⌘B)"
        >
          <IconBold />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          isActive={s.isItalic}
          label="Italic (⌘I)"
        >
          <IconItalic />
        </ToolbarButton>

        <Separator />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          isActive={s.isBulletList}
          label="Bullet list"
        >
          <IconBulletList />
        </ToolbarButton>

        <Separator />

        {/* Code */}
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleCode().run()}
          isActive={s.isCode}
          label="Inline code"
        >
          <IconCode />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          isActive={s.isCodeBlock}
          label="Code block"
        >
          <IconCodeBlock />
        </ToolbarButton>

        <Separator />

        {/* Insert */}
        <ToolbarButton
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          isActive={false}
          label="Horizontal rule"
        >
          <IconHorizontalRule />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="tiptap-editor min-h-56 bg-white p-4 text-gray-900"
      />
    </div>
  );
}
