import { useEffect, useState } from "react";
import "./index.css";

import HtmlPreview from "./HtmlPreview";
import HtmlEditor from "./HtmlEditor";
import JsonEditor from "./JsonEditor";
import Footer from "./Footer";
import Header from "./Header";
import { finalHtmlToJson, finalJsonToHtml } from "./utils";
import { useGlobalContext } from "./contexts/global.context";
import { ACTIONS } from "./reducers/global.reducer";
import { LoadingOutlined } from "@ant-design/icons";
import { notification, Spin } from "antd";

// const virtualConsole = new jsdom.VirtualConsole();
// virtualConsole.on("error", () => {
//   // No-op to skip console errors.
// });

export default function App() {
    
  const { state, dispatch } = useGlobalContext();
  const { html, json, jsonToHtmlOptions, htmlToJsonOptions } = state;
  const allowNonStandard = (jsonToHtmlOptions.allowNonStandardTypes && htmlToJsonOptions.allowNonStandardTags) ?? false;

  const [isLoading, setIsLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("j");
    if (!slug) return;
    setIsLoading(true);
    fetch(`${window.location.origin}/api/bin?id=${slug}`, {
      method: "GET",
    })
      .then((res) => res.text())
      .then((data) => {
        const parsedData = eval(`(${data})`)
        let json = parsedData;
        
        if(!('json' in parsedData) || !('jsonToHtmlOptions' in parsedData) || !('htmlToJsonOptions' in parsedData)){
          setJson(parsedData);
        } else {
          setJson(parsedData.json);
          json = parsedData.json;
          dispatch({ type: ACTIONS.SET_JSON_TO_HTML_OPTIONS, payload: parsedData.jsonToHtmlOptions });
          dispatch({ type: ACTIONS.SET_HTML_TO_JSON_OPTIONS, payload: parsedData.htmlToJsonOptions });
        }

        const html = finalJsonToHtml(json, parsedData.jsonToHtmlOptions);
        setHtml(html);


        api.open({
          message: 'Saved data loaded successfully',
          description:'You can now edit the data. Enjoy !!',
          showProgress: true,
          closable: true,
        });
      })
      .catch((e) => {
        console.error(e);
        api.error({
          message: 'Error loading saved data',
          description: 'Please try again later.',
          showProgress: true,
          closable: true,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const setHtml = (html: string) => {
    dispatch({ type: ACTIONS.SET_HTML, payload: { html } });
  }
  
  const setJson = (json: Record<string, unknown>) => {
    dispatch({ type: ACTIONS.SET_JSON, payload: { json } });
  }

  const toggleAllowNonStandard = () => {
    dispatch({ type: ACTIONS.SET_ALLOW_NON_STANDARD, payload: { allowNonStandard: !allowNonStandard } });
  }

  return (
    <div>
      {contextHolder}
      {isLoading && <Spin fullscreen tip="Getting saved data..." indicator={<LoadingOutlined style={{ fontSize: 48, color: "white" }} spin />} />}
      <Header />
      <div className="main">
        <HtmlEditor html={html} onChange={setHtml} />
        <HtmlPreview html={html} />
        <JsonEditor json={json} onChange={setJson} />
        <Footer
          htmlToJson={() => {
            const json = finalHtmlToJson(html, htmlToJsonOptions);
            setJson(json);
          }}
          jsonToHtml={() => {
            const html = finalJsonToHtml(json, jsonToHtmlOptions);
            setHtml(html);
          }}
          toggleNonStandard={toggleAllowNonStandard}
          allowNonStandard={allowNonStandard}
        />
      </div>
    </div>
  );
}