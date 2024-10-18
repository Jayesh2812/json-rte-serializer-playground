import { Editor } from '@monaco-editor/react';
import prettify from "pretty";

function HtmlEditor({html, onChange, height}: {html: string, onChange?: (s: string) => void, height?: string}) {
  return (
    <div className="html">
        <Editor
        options={{readOnly: !onChange, wordWrap: !onChange ? "on" : "off"}}
          height= {height ?? "50vh" }
          theme="vs-dark"
          language="html"
          value={prettify(html)}
          onChange={(s: any) => {
            if (!s) return;
            onChange?.(s);
          }}
        />
      </div>
  )
}

export default HtmlEditor