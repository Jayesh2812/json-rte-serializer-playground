import { cbModal } from "@contentstack/venus-components";
import {
  ModalBody,
  ModalHeader,
} from "@contentstack/venus-components";

function HtmlPreview({ html }: { html: string }) {
  const handleFullScreen = () => {
    cbModal({
      component: FullScreenModal,
      modalProps: {
      size: 'max',
      }
    });
  };

  const FullScreenModal = ({ closeModal }: any) => (
    <div id="123">
      <ModalHeader closeModal={closeModal} title={"Render View"} />
      <ModalBody>
        <Render />
      </ModalBody>
    </div>
  );

  const Render = () => (
    <div className="render" dangerouslySetInnerHTML={{ __html: html }}></div>
  );

  return (
    <div style={{ position: "relative" }}>
      <button
        style={{ position: "absolute", right: 0 }}
        onClick={handleFullScreen}
      >
        Full screen
      </button>
      <Render />
    </div>
  );
}

export default HtmlPreview;
