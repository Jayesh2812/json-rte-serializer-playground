import { Button, Checkbox } from "antd";

function Footer({ htmlToJson, jsonToHtml, toggleNonStandard, allowNonStandard }: { htmlToJson: () => void; jsonToHtml: () => void, toggleNonStandard: () => void, allowNonStandard: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        position: "fixed",
        width: "100%",
        background: "rgba(150, 150, 150, 0.5)",
        bottom: 0,
        paddingBlock: "1em",
      }}
    >
      <Button color="default" variant="solid"
        onClick={htmlToJson}
      >
        HTML to JSON
      </Button>
      <div className="params">
        <div className="input">
          <Checkbox
            id="allowNonStandardTypes"
            checked={allowNonStandard}
            onChange={() => {
              toggleNonStandard()
            }}
          >
            Allow Non Standard
          </Checkbox>
        </div>
      </div>
      <Button color="default" variant="solid"
        onClick={jsonToHtml}
      >
        JSON TO HTML
      </Button>
    </div>
  );
}

export default Footer;
