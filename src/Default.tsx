import { useEffect } from "react";
import "./index.css";

import HtmlPreview from "./HtmlPreview";
import HtmlEditor from "./HtmlEditor";
import JsonEditor from "./JsonEditor";
import Footer from "./Footer";
import Header from "./Header";
import { finalHtmlToJson, finalJsonToHtml } from "./utils";
import { useGlobalContext } from "./contexts/global.context";

// const virtualConsole = new jsdom.VirtualConsole();
// virtualConsole.on("error", () => {
//   // No-op to skip console errors.
// });
export default function App() {
    
  const { html, setHtml, json, setJson, allowNonStandard, setAllowNonStandard } = useGlobalContext();

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("j");
    if (!slug) return;
    fetch(`${window.location.origin}/api/bin?id=${slug}`, {
      method: "GET",
    })
      .then((res) => res.text())
      .then((data) => {
        setJson(JSON.parse(data));
        const html = finalJsonToHtml(JSON.parse(data), allowNonStandard);
        setHtml(html);
      })
      .catch((e) => {
        console.error(e);
      })
      ;
  }, []);

  
  

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("a", Number(allowNonStandard).toString());
    history.replaceState({}, "", `${url.href}`);
  }, [allowNonStandard]);

  return (
    <div>
      <Header />
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
