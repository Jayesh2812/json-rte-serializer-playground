import React, { useEffect } from "react";

import ContentstackSDK from "@contentstack/app-sdk";
import get from "lodash.get";
import HtmlEditor from "./HtmlEditor";
import { finalJsonToHtml, getAllJsonRtePaths } from "./utils";
import HtmlPreview from "./HtmlPreview";

function Sidebar() {
  const [entry, setEntry] = React.useState({} as any);
  const [schema, setSchema] = React.useState([] as any);
  const [path, setPath] = React.useState("");
  const [html, setHtml] = React.useState("");
  const [showRendered, setShowRendered] = React.useState(false)

  const paths = !(entry || schema) ? [] : getAllJsonRtePaths(schema, entry);

  useEffect(() => {
    ContentstackSDK.init().then(async function (appSdk) {
      // Get the AppConfigWidget object
      
      appSdk.location.SidebarWidget?.entry.onChange((updatedEntry) => {
        setEntry(updatedEntry);
      });

      const entry = appSdk.location.SidebarWidget?.entry._changedData ?? appSdk.location.SidebarWidget?.entry._data;
      const schema = appSdk.location.SidebarWidget?.entry.content_type.schema;
      setEntry(entry);
      setSchema(schema);
    });
  }, []);

  useEffect(() => {
    if (!entry || !paths.length) {
      return;
    }

    if (!path) {
      setHtml(finalJsonToHtml(get(entry, paths[0]), false));
    } else {
      setHtml(finalJsonToHtml(get(entry, path), false));
    }
  }, [entry, path]);

  return (
    <div>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '0.5rem'}} >


      <select name="Choose Field" onChange={(e) => setPath(e.target.value)}>
        {paths.map((path: string) => (
          <option key={path} value={path}>
            {path}
          </option>
        ))}
      </select>

      <input type="checkbox" checked={!showRendered} onClick={() => setShowRendered(showRendered => !showRendered)} title="Toggle Render view"/>

      <button onClick={() => {
        navigator.clipboard.writeText(JSON.stringify(get(entry, path || paths[0]), null, 2));
      }}>Copy JSON</button>


      </div>

      {showRendered ? <HtmlEditor html={html ?? ""} height="100vh"/> : <HtmlPreview html={html ?? ""} />
}
    </div>
  );
}

export default Sidebar;
