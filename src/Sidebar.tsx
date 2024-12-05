import React, { useEffect, useState } from "react";

import ContentstackSDK from "@contentstack/app-sdk";
import get from "lodash.get";
import HtmlEditor from "./HtmlEditor";
import { closeFullModal, finalJsonToHtml, getAllJsonRtePaths, showFullModal } from "./utils";
import HtmlPreview from "./HtmlPreview";
import { Button, Modal, notification, Select, Switch } from "antd";
import { CopyFilled, ImportOutlined } from "@ant-design/icons";
import JsonEditor from "./JsonEditor";

function Sidebar() {
  const [entry, setEntry] = React.useState({} as any);
  const [schema, setSchema] = React.useState([] as any);
  const [path, setPath] = React.useState("");
  const [html, setHtml] = React.useState("");
  const [showRendered, setShowRendered] = React.useState(false);

  const paths = !(entry || schema) ? [] : getAllJsonRtePaths(schema, entry);

  useEffect(() => {
    ContentstackSDK.init().then(async function (appSdk) {

      appSdk.location.SidebarWidget?.entry.onChange((updatedEntry) => {
        setEntry(updatedEntry);
      });

      const entry =
        appSdk.location.SidebarWidget?.entry._changedData ??
        appSdk.location.SidebarWidget?.entry._data;
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

  const [api, contextHolder] = notification.useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleOk() {
    closeFullModal();
    setIsModalOpen(false);
  }
  function handleCancel() {
    closeFullModal();
    setIsModalOpen(false);
  }

  return (
    <div>
      {contextHolder}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "1rem",
          gap: "0.5rem",
        }}
      >
        <Select
          onChange={(value) => setPath(value)}
          defaultValue={paths[0]}
          style={{ flex: 1 }}
        >
          {paths.map((path: string) => (
            <Select.Option key={path} value={path}>
              {path}
            </Select.Option>
          ))}
        </Select>

        <Switch
          checked={!showRendered}
          onClick={() => setShowRendered((showRendered) => !showRendered)}
          title="Toggle Render view"
        />

        <Button
          icon={<CopyFilled />}
          variant="solid"
          color="default"
          onClick={() => {
            navigator.clipboard.writeText(
              JSON.stringify(get(entry, path || paths[0]), null, 2)
            );
            api.success({
              message: "Copied to clipboard",
              placement:"bottom"
            });
          }}
        ></Button>

        <Button
        icon={<ImportOutlined />}
        onClick={() => {
          showFullModal();
          setIsModalOpen(true);
        }}
        />
      </div>

      <Modal open={isModalOpen} onOk={handleOk} onCancel={handleCancel} styles={{content: {maxHeight: "90vh", overflow: "scroll"} }}>
        <JsonEditor json={get(entry, path || paths[0])} onChange={() => {}}/>
      </Modal>

      {showRendered ? (
        <HtmlEditor html={html ?? ""} height="100vh" />
      ) : (
        <HtmlPreview html={html ?? ""} />
      )}
    </div>
  );
}

export default Sidebar;
