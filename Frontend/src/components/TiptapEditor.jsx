import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  Heading1, Heading2, List, ListOrdered, Quote, Link as LinkIcon, Unlink
} from 'lucide-react';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-purple-100 bg-purple-50/50 rounded-t-xl">
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
        className={`p-1.5 rounded-lg ${editor.isActive('bold') ? 'bg-purple-200 text-purple-700' : 'text-gray-600 hover:bg-purple-100'}`}
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
        className={`p-1.5 rounded-lg ${editor.isActive('italic') ? 'bg-purple-200 text-purple-700' : 'text-gray-600 hover:bg-purple-100'}`}
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
        className={`p-1.5 rounded-lg ${editor.isActive('underline') ? 'bg-purple-200 text-purple-700' : 'text-gray-600 hover:bg-purple-100'}`}
        title="Underline"
      >
        <UnderlineIcon size={16} />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run(); }}
        className={`p-1.5 rounded-lg ${editor.isActive('strike') ? 'bg-purple-200 text-purple-700' : 'text-gray-600 hover:bg-purple-100'}`}
        title="Strikethrough"
      >
        <Strikethrough size={16} />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleCode().run(); }}
        className={`p-1.5 rounded-lg ${editor.isActive('code') ? 'bg-purple-200 text-purple-700' : 'text-gray-600 hover:bg-purple-100'}`}
        title="Inline Code"
      >
        <Code size={16} />
      </button>
      
      <div className="w-px h-6 bg-purple-200 mx-1 self-center"></div>

      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run(); }}
        className={`p-1.5 rounded-lg ${editor.isActive('heading', { level: 1 }) ? 'bg-purple-200 text-purple-700' : 'text-gray-600 hover:bg-purple-100'}`}
        title="Heading 1"
      >
        <Heading1 size={16} />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}
        className={`p-1.5 rounded-lg ${editor.isActive('heading', { level: 2 }) ? 'bg-purple-200 text-purple-700' : 'text-gray-600 hover:bg-purple-100'}`}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
        className={`p-1.5 rounded-lg ${editor.isActive('bulletList') ? 'bg-purple-200 text-purple-700' : 'text-gray-600 hover:bg-purple-100'}`}
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
        className={`p-1.5 rounded-lg ${editor.isActive('orderedList') ? 'bg-purple-200 text-purple-700' : 'text-gray-600 hover:bg-purple-100'}`}
        title="Ordered List"
      >
        <ListOrdered size={16} />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }}
        className={`p-1.5 rounded-lg ${editor.isActive('blockquote') ? 'bg-purple-200 text-purple-700' : 'text-gray-600 hover:bg-purple-100'}`}
        title="Blockquote"
      >
        <Quote size={16} />
      </button>

      <div className="w-px h-6 bg-purple-200 mx-1 self-center"></div>

      <button
        onClick={(e) => { e.preventDefault(); setLink(); }}
        className={`p-1.5 rounded-lg ${editor.isActive('link') ? 'bg-purple-200 text-purple-700' : 'text-gray-600 hover:bg-purple-100'}`}
        title="Link"
      >
        <LinkIcon size={16} />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().unsetLink().run(); }}
        className={`p-1.5 rounded-lg text-gray-600 hover:bg-purple-100`}
        disabled={!editor.isActive('link')}
        title="Unlink"
      >
        <Unlink size={16} />
      </button>
    </div>
  );
};

const TiptapEditor = ({ content, onChange, placeholder = 'Write your note here...' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Exclude extensions we are adding manually to avoid duplicates
        strike: false, // we re-add via StarterKit default, keep it; only exclude if added separately
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-purple-600 underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left before:pointer-events-none',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-4 min-h-[150px] max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1',
      },
    },
  });

  useEffect(() => {
    if (editor && content && !editor.isFocused) {
      const currentJSON = editor.getJSON();
      if (JSON.stringify(currentJSON) !== JSON.stringify(content)) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  return (
    <div className="border border-purple-100 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col h-full min-h-[250px]">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto cursor-text bg-white" onClick={() => editor?.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TiptapEditor;
