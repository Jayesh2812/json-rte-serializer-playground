import { useEffect, useState } from "react";
import "./index.css";
import { jsonToHtml, htmlToJson } from "@contentstack/json-rte-serializer";
import collapse from "collapse-whitespace";
import HtmlPreview from "./HtmlPreview";
import HtmlEditor from "./HtmlEditor";
import JsonEditor from "./JsonEditor";
import Footer from "./Footer";

// const virtualConsole = new jsdom.VirtualConsole();
// virtualConsole.on("error", () => {
//   // No-op to skip console errors.
// });
export default function App() {
  const [html, setHtml] = useState("<h1>HTML</h1>");
  const [allowNonStandard, setAllowNonStandard] = useState(localStorage.getItem('allowNonStandard') === 'true');

  useEffect(() => {
    localStorage.setItem('allowNonStandard', allowNonStandard.toString())
  }, [allowNonStandard])

  const finalHtmlToJson = (html: string) => {
    const htmlDomBody = new DOMParser().parseFromString(html, "text/html").body;
    collapse(htmlDomBody);
    htmlDomBody.normalize();
    const jsonValue = htmlToJson(htmlDomBody, {
      allowNonStandardTags: allowNonStandard,
    })!;
    return jsonValue;
  };

  const finalJsonToHtml = (json: any) => {
    return jsonToHtml(json, { allowNonStandardTypes: allowNonStandard });
  };
  const [json, setJson] = useState(finalHtmlToJson(html));

  // useEffect(() => {
  //   const json = finalHtmlToJson(html);
  //   setJson(json);
  // }, [html]);

  // useEffect(() => {
  //   const html = finalJsonToHtml(json);
  //   setHtml(html);
  // }, [json])
useEffect(() => {
  document.addEventListener('storage', (e) => {
    console.log(e)
  })
}, [])
  return (
    
    <div className="main">
      <HtmlEditor html={html} onChange={setHtml} />
      <HtmlPreview html={html}/>
      <JsonEditor json={json} onChange={setJson} />
      <Footer
        htmlToJson={() => {
          const json = finalHtmlToJson(html);
          setJson(json);
        }}
        jsonToHtml={() => {
          const html = finalJsonToHtml(json);
          setHtml(html);
        }}
        toggleNonStandard={() => {
          setAllowNonStandard((prev) => !prev);
        }}
        allowNonStandard={allowNonStandard}
      />
    </div>
  );
}
