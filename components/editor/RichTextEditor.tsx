import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Toolbar from './Toolbar';
import { storageService } from '../../services/storage';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  locale?: 'az' | 'ru';
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder,
  locale = 'az',
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-pink-600 underline',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || (locale === 'az' ? 'Məzmunu buraya yazın...' : 'Напишите содержимое здесь...'),
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-pink max-w-none focus:outline-none min-h-[300px] px-4 py-3',
      },
    },
  });

  const handleImageUpload = async (file: File) => {
    if (!editor) return;

    const { url, error } = await storageService.uploadImage(file, {
      folder: 'editor',
      maxSizeMB: 5,
    });

    if (error || !url) {
      alert(locale === 'az' ? 'Şəkil yüklənərkən xəta baş verdi' : 'Ошибка при загрузке изображения');
      return;
    }

    editor.chain().focus().setImage({ src: url }).run();
  };

  if (!editor) {
    return <div className="border border-gray-300 rounded-lg p-4 min-h-[300px] bg-gray-50 animate-pulse"></div>;
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-pink-500 focus-within:border-pink-500">
      <Toolbar editor={editor} onImageUpload={handleImageUpload} locale={locale} />
      <EditorContent editor={editor} className="min-h-[300px] max-h-[600px] overflow-y-auto" />
    </div>
  );
};

export default RichTextEditor;

