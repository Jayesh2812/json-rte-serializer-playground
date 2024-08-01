import { Modal } from "antd";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

function HtmlPreview({ html }: { html: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        style={{ position: "absolute", right: 0 }}
        onClick={() => setIsModalOpen(true)}
      >
        Full screen
      </button>
      <div className="render" contentEditable dangerouslySetInnerHTML={{ __html: html }}></div>

      {createPortal(
        <dialog
          open={isModalOpen}
          style={{
            width: "90vw",
            height: "90vh",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "20px",
            boxShadow: "0 0 0 10000px rgba(0, 0, 0, .5)",
            overflow: "scroll",
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsModalOpen(false);
            }
          }}
        >
          <div
            className="render"
            dangerouslySetInnerHTML={{ __html: html }}
          ></div>
          <button
            style={{ position: "absolute", right: 0, top: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            {" "}
            Close{" "}
          </button>
        </dialog>,
        document.body
      )}
    </div>
  );
}

export default HtmlPreview;
