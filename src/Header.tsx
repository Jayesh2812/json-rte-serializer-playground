import { Button, notification, Spin } from "antd";
import { useGlobalContext } from "./contexts/global.context";
import prettify from "pretty";
import { ACTIONS } from "./reducers/global.reducer";
import { stringify } from "javascript-stringify";
import { useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";

function Header() {


  const { state, dispatch } = useGlobalContext();
  const { html, json, jsonToHtmlOptions, htmlToJsonOptions } = state;
  const [isLoading, setIsLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const setHtml = (html: string) => {
    dispatch({ type: ACTIONS.SET_HTML, payload: { html } });
  }

  return (
    <header>
      {contextHolder}
      {isLoading && <Spin fullscreen tip="Generating URL..." indicator={<LoadingOutlined style={{ fontSize: 48, color: "white" }} spin />} />}
      <Button variant="solid" color="default" onClick={() => {

        const defaultAttrsToRemove = ["data-.*", "aria-.*"];

        const attributes = prompt("Enter the attributes to remove separated by comma (,)", defaultAttrsToRemove.join(", "))?.split(",").map((attr) => attr.trim());
        if(!attributes) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(`<body>${html}</body>`, "text/html").body;
        const elements = doc.querySelectorAll("*");
        elements.forEach((element) => {
          attributes.forEach((attr) => {
            const attrs = Array.from(element.attributes).map((a) => a.name).filter(a => a.match(attr));
            attrs.forEach(a => element.removeAttribute(a))  
          });
        }); 

      setHtml(prettify(doc.innerHTML));
        
      }}> Remove HTML Attributes </Button>

      <Button variant="solid" color="default"
        id="share-btn"
        loading={isLoading}
        onClick={async () => {
          const url = new URL(window.location.href);
          try{
            setIsLoading(true);
            const response = await fetch(`${window.location.origin}/api/bin`, {
              method: "POST",
              body: stringify({json, jsonToHtmlOptions, htmlToJsonOptions}),
            });

            if(!response.ok){
              throw new Error(await response.text());
            }
            const pasteBinSlug = await response.text();   
            url.searchParams.set("j", pasteBinSlug);
            
            navigator.clipboard.writeText(url.toString());
            history.pushState({}, '', url.href)
            
            api.success({
              message: 'URL Copied to clipboard',
              description: 'You can now share the URL with others.',
              showProgress: true,
              closable: true,
            });
          }
          catch(e){
            if( e instanceof Error){
              api.error({
                message: 'Error sharing data',
                description: e.message,
                showProgress: true,
                closable: true,
              });
            }
            else{
              api.error({
                message: 'Error sharing data',
                description: 'Please try again later.',
                showProgress: true,
                closable: true,
              });
            }
          } finally {
            setIsLoading(false);
          }
        }}
      >
        Share with JSON
      </Button>
    </header>
  );
}

export default Header;
