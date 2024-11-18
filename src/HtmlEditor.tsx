import { Editor } from '@monaco-editor/react';
import { emmetHTML, emmetCSS } from "emmet-monaco-es";

function HtmlEditor({html, onChange, height}: {html: string, onChange?: (s: string) => void, height?: string}) {
  return (
    <div className="html">
        <Editor
        options={{readOnly: !onChange, wordWrap: !onChange ? "on" : "off"}}
          height= {height ?? "50vh" }
          theme="vs-dark"
          language="html"
          value={html}
          onMount={(editor, monaco) => {
            emmetHTML(monaco);
            emmetCSS(monaco);
          }}
          onChange={(s: any) => {
            if (!s) return;
            onChange?.(s);
          }}
        />
      </div>
  )
}

export default HtmlEditor