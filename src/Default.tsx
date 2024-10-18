import { useEffect, useState } from "react";
import "./index.css";

import HtmlPreview from "./HtmlPreview";
import HtmlEditor from "./HtmlEditor";
import JsonEditor from "./JsonEditor";
import Footer from "./Footer";
import Header from "./Header";
import { finalHtmlToJson, finalJsonToHtml } from "./utils";

// const virtualConsole = new jsdom.VirtualConsole();
// virtualConsole.on("error", () => {
//   // No-op to skip console errors.
// });
export default function App() {
  

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("j");
    if (!slug) return;
    fetch(`${window.location.origin}/api/bin?id=${slug}`, {
      method: "GET",
    })
      .then((res) => res.text())
      .then((data) => {
        setJson(JSON.parse(data));
      })
      .catch((e) => {
        console.error(e);
      })
      ;
  }, []);

  const [allowNonStandard, setAllowNonStandard] = useState(
    !!parseInt(new URLSearchParams(window.location.search).get("a") ?? "0")
  );
  const [html, setHtml] = useState("<h1>HTML</h1>");
  const [json, setJson] = useState(finalHtmlToJson(html, allowNonStandard));

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("a", Number(allowNonStandard).toString());
    history.replaceState({}, "", `${url.href}`);
  }, [allowNonStandard]);

  return (
    <div>
      <Header json={json} html={html} />
      <div className="main">
        <HtmlEditor html={html} onChange={setHtml} />
        <HtmlPreview html={html} />
        <JsonEditor json={json} onChange={setJson} />
        <Footer
          htmlToJson={() => {
            const json = finalHtmlToJson(html, allowNonStandard);
            setJson(json);
          }}
          jsonToHtml={() => {
            const html = finalJsonToHtml(json, allowNonStandard);
            setHtml(html);
          }}
          toggleNonStandard={() => {
            setAllowNonStandard((prev) => !prev);
          }}
          allowNonStandard={allowNonStandard}
        />
      </div>
    </div>
  );
}
