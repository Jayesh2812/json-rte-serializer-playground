import { Editor } from '@monaco-editor/react';
import { jsonrepair } from 'jsonrepair';

function JsonEditor({json, onChange}: {json: any, onChange: (s: any) => void}) {
  return (
    <div className="json">
        <Editor
          height="100vh"
          theme="vs-dark"
          defaultLanguage="json"
          value={JSON.stringify(json, null, 4)}
          onChange={(s: any) => {
            if (!s) return;
            onChange(JSON.parse(jsonrepair(s)));
          }}
        />
      </div>
  )
}

export default JsonEditor