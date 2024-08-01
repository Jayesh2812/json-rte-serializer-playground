import { Editor } from '@monaco-editor/react';
import prettify from "pretty";

function HtmlEditor({html, onChange}: {html: string, onChange: (s: string) => void}) {
  return (
    <div className="html">
        <Editor
          height="50vh"
          theme="vs-dark"
          language="html"
          value={prettify(html)}
          onChange={(s: any) => {
            if (!s) return;
            onChange(s);
          }}
        />
      </div>
  )
}

export default HtmlEditor