import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import dynamic from 'next/dynamic'; // 使用 dynamic 导入 ReactQuill，确保它在客户端渲染

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ name, control, initialValue }) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [
        { list: 'ordered' },
        { list: 'bullet' },
        { indent: '-1' },
        { indent: '+1' },
      ],
      [{ color: [] }, { background: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={initialValue}
      render={({ field }) => (
        <ReactQuill
          value={field.value}
          onChange={(value) => field.onChange(value)}
          modules={modules}
        />
      )}
    />
  );
};

export default RichTextEditor;

// ['bold', 'italic', 'underline', 'strike'], // toggled buttons
//   ['blockquote', 'code-block'],
//   [{ header: 1 }, { header: 2 }], // custom button values
//   [{ list: 'ordered' }, { list: 'bullet' }],
//   [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
//   [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
//   [{ direction: 'rtl' }], // text direction
//   [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
//   [{ header: [1, 2, 3, 4, 5, 6, false] }],
//   [{ color: [] }, { background: [] }], // dropdown with defaults from theme
//   [{ font: [] }],
//   [{ align: [] }],
//   ['clean'];
