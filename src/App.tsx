import { useEffect, useState } from "react";
import "./index.css";
import { jsonToHtml, htmlToJson } from "@contentstack/json-rte-serializer";
import collapse from "collapse-whitespace";
import HtmlPreview from "./HtmlPreview";
import HtmlEditor from "./HtmlEditor";
import JsonEditor from "./JsonEditor";
import Footer from "./Footer";
import Header from "./Header";

// const virtualConsole = new jsdom.VirtualConsole();
// virtualConsole.on("error", () => {
//   // No-op to skip console errors.
// });
export default function App() {
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
  const [json, setJson] = useState(finalHtmlToJson(html));

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("a", Number(allowNonStandard).toString());
    history.replaceState({}, "", `${url.href}`);
  }, [allowNonStandard]);

  useEffect(() => {
    document.addEventListener("storage", (e) => {
      console.log(e);
    });
  }, []);
  return (
    <div>
      <Header json={json} html={html} />
      <div className="main">
        <HtmlEditor html={html} onChange={setHtml} />
        <HtmlPreview html={html} />
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
    </div>
  );
}
