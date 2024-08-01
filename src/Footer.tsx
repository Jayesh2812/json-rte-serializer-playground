
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
      <button
        onClick={htmlToJson}
      >
        HTML to JSON
      </button>
      <div className="params">
        <div className="input">
          <input
            id="allowNonStandardTypes"
            type="checkbox"
            checked={allowNonStandard}
            onChange={() => {
              toggleNonStandard()
            }}
          />
          <label title="Click to change" htmlFor="allowNonStandardTypes">
            Allow Non Standard
          </label>
        </div>
      </div>
      <button
        onClick={jsonToHtml}
      >
        JSON TO HTML
      </button>
    </div>
  );
}

export default Footer;
