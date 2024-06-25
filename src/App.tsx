import { useEffect, useRef, useState } from "react";
import "./index.css";
import { jsonToHtml, htmlToJson } from "@contentstack/json-rte-serializer";
import Editor from "@monaco-editor/react";
import prettify from "pretty";
import collapse from "collapse-whitespace";
// const virtualConsole = new jsdom.VirtualConsole();
// virtualConsole.on("error", () => {
//   // No-op to skip console errors.
// });
export default function App() {
  const [html, setHtml] = useState("");
  const [json, setJson] = useState({});
  const [allowNonStandardTags, setAllowNonStandardTags] = useState(false);
  const htmlRef = useRef<HTMLElement>(null)

  const finalHtmlToJson = (html: string) => {
    const htmlDomBody = new DOMParser().parseFromString(html, "text/html").body;
    collapse(htmlDomBody);
    htmlDomBody.normalize();
    const jsonValue = htmlToJson(htmlDomBody, { allowNonStandardTags })!;
    return jsonValue;
  };

  const finalJsonToHtml = (json: any) => {
    return jsonToHtml(json, { allowNonStandardTypes: allowNonStandardTags })
  };

  useEffect(() => {
    console.log(htmlRef.current)
    if(!htmlRef.current) return
    htmlRef.current.addEventListener('focus', () => {
      console.log("HTML")
    })

  }, [htmlRef])
  return (
    <div className="main">
      <div className="html">
        <Editor
          height="50vh"
          theme="vs-dark"
          language="html"
          value={prettify(html)}
          onChange={(s: any) => {
            if (!s) return;
            // if(autoUpdate === "html") return
            setHtml(s);
            const json = finalHtmlToJson(s);
            setJson(json);
            // if (autoUpdate) finalHtmlToJson();
          }}
        />
      </div>
      <div className="render" dangerouslySetInnerHTML={{ __html: html }}></div>
      <div className="json">
        <Editor
          height="100vh"
          theme="vs-dark"
          defaultLanguage="json"
          value={JSON.stringify(json, null, 4)}
          onChange={(s: any) => {
            if (!s) return;
            setJson(JSON.parse(s));
            const html = finalJsonToHtml(json);
            setHtml(html)
          }}
        />
      </div>
      <br />

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          position: "fixed",
          width: "100%",
          background: "rgba(150, 150, 150, 0.5)",
          bottom: 0,
          paddingBlock: "1em",
        }}
      >
        <button onClick={() => finalHtmlToJson(html)}>HTML to JSON</button>
        <div className="params">
          <div className="input">
            <input
              id="allowNonStandardTypes"
              type="checkbox"
              checked={allowNonStandardTags}
              onChange={() => setAllowNonStandardTags(!allowNonStandardTags)}
            />
            <label title="Click to change" htmlFor="allowNonStandardTypes">
              allowNonStandardTypes
            </label>
          </div>
        </div>
        <button onClick={() => finalJsonToHtml(json)}>JSON TO HTML</button>
      </div>
    </div>
  );
}


