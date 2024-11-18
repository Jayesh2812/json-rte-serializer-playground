
import { FullscreenExitOutlined, FullscreenOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import { useState } from "react";

function HtmlPreview({ html }: { html: string }) {
  const Render = () => (
    <div className="render" dangerouslySetInnerHTML={{ __html: html }}></div>
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = async () => {
    if(window.iframeRef) window.iframeRef.style.opacity = 0;
    await window.postRobot?.sendToParent('goFullscreen', {
      open: true
    });

    setIsModalOpen(true);
  };

  const closeModal = async () => {
    await window.postRobot?.sendToParent('goFullscreen', {
      open: false
    });
    if(window.iframeRef) window.iframeRef.style.opacity = null;

  }

  const handleOk = () => {
    closeModal();
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    closeModal();
    setIsModalOpen(false);
  };

  return (
    <div style={{ position: "relative" }}>  
      <Button shape="circle" type="primary" icon={isModalOpen ? <FullscreenExitOutlined/> : <FullscreenOutlined/>} onClick={showModal} style={{ position: "absolute", right: "0.5rem", top: "0.5rem" }} />
      <Render />
      <Modal open={isModalOpen} onOk={handleOk} onCancel={handleCancel} styles={{content: {maxHeight: "90vh", overflow: "scroll"} }}>
        <Render />
      </Modal>
    </div>
  );
}

export default HtmlPreview;
