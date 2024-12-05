
import { FullscreenExitOutlined, FullscreenOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import { useState } from "react";
import { closeFullModal, showFullModal } from "./utils";

function HtmlPreview({ html }: { html: string }) {
  const Render = () => (
    <div className="render" dangerouslySetInnerHTML={{ __html: html }}></div>
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = async () => {
    showFullModal()
    setIsModalOpen(true);
  };



  const handleOk = () => {
    closeFullModal();
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    closeFullModal();
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
