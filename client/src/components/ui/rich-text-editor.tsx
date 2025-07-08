import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Table } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ initialContent, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    if (editorRef.current && initialContent !== content) {
      editorRef.current.innerHTML = initialContent;
      setContent(initialContent);
    }
  }, [initialContent]);

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      onChange(newContent);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleContentChange();
  };

  const insertTable = () => {
    const tableHTML = `
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #d1d5db; margin: 16px 0;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="border: 1px solid #d1d5db; padding: 8px 16px; text-align: left;">헤더 1</th>
            <th style="border: 1px solid #d1d5db; padding: 8px 16px; text-align: left;">헤더 2</th>
            <th style="border: 1px solid #d1d5db; padding: 8px 16px; text-align: left;">헤더 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 8px 16px;">데이터 1</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 16px;">데이터 2</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 16px;">데이터 3</td>
          </tr>
          <tr>
            <td style="border: 1px solid #d1d5db; padding: 8px 16px;">데이터 4</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 16px;">데이터 5</td>
            <td style="border: 1px solid #d1d5db; padding: 8px 16px;">데이터 6</td>
          </tr>
        </tbody>
      </table>
    `;
    
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const div = document.createElement('div');
        div.innerHTML = tableHTML;
        range.insertNode(div.firstChild!);
      }
      handleContentChange();
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-3 flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand('bold')}
          className="p-2 hover:bg-gray-200"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand('italic')}
          className="p-2 hover:bg-gray-200"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand('underline')}
          className="p-2 hover:bg-gray-200"
        >
          <Underline className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300"></div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand('insertUnorderedList')}
          className="p-2 hover:bg-gray-200"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => execCommand('insertOrderedList')}
          className="p-2 hover:bg-gray-200"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={insertTable}
          className="p-2 hover:bg-gray-200"
        >
          <Table className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300"></div>

        <select
          onChange={(e) => execCommand('formatBlock', e.target.value)}
          className="text-sm border-none bg-transparent"
          defaultValue=""
        >
          <option value="">스타일</option>
          <option value="h1">제목 1</option>
          <option value="h2">제목 2</option>
          <option value="h3">제목 3</option>
          <option value="p">본문</option>
        </select>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-96 p-4 focus:outline-none prose max-w-none"
        style={{
          lineHeight: '1.6',
        }}
        onInput={handleContentChange}
        onBlur={handleContentChange}
        dangerouslySetInnerHTML={{ __html: initialContent }}
      />
    </div>
  );
}
