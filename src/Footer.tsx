import { SettingFilled } from "@ant-design/icons";
import { Button, Checkbox, Modal, TabsProps } from "antd";
import { useRef, useState } from "react";
import { Editor, Monaco } from "@monaco-editor/react";
import { Tabs } from "antd";
import { useGlobalContext } from "./contexts/global.context";
import { TYPE_DEFS } from "./constants/json-rte-serializer";
import monaco, { IKeyboardEvent } from "monaco-editor";
import { extractOptions } from "./utils";

import { stringify } from "javascript-stringify";
import { ACTIONS } from "./reducers/global.reducer";

const TabIds = {
  J2H: "j2h",
  H2J: "h2j",
} as const;

type ITabId = (typeof TabIds)[keyof typeof TabIds];

function Footer({
  htmlToJson,
  jsonToHtml,
  toggleNonStandard,
  allowNonStandard,
}: {
  htmlToJson: () => void;
  jsonToHtml: () => void;
  toggleNonStandard: () => void;
  allowNonStandard: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tab, setTab] = useState<ITabId>(TabIds.J2H);
  const [triggerRender, setTriggerRender] = useState(false);
  const J2HEditorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const H2JEditorRef = useRef<monaco.editor.IStandaloneCodeEditor>();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    const h2jOptions = H2JEditorRef.current?.getModel()?.getValue();
    const j2hOptions = J2HEditorRef.current?.getModel()?.getValue();
    const h2jOptionsObject = extractOptions(h2jOptions!);
    const j2hOptionsObject = extractOptions(j2hOptions!);
    dispatch({
      type: ACTIONS.SET_HTML_TO_JSON_OPTIONS,
      payload: h2jOptionsObject,
    });
    dispatch({
      type: ACTIONS.SET_JSON_TO_HTML_OPTIONS,
      payload: j2hOptionsObject,
    });

    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setTriggerRender(!triggerRender);
    setIsModalOpen(false);
  };

  const onChange = (key: string) => {
    console.log(key);
  };

  const intialFoldInterfaces = async (
    editor: monaco.editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    const model = editor.getModel()!;
    const content = model.getValue();
    const lines = content.split("\n");

    const selectionRanges = Object.entries(TYPE_DEFS)
      .map(([key, value]) => {
        const line = lines.findIndex((line) => line === `interface ${key} {`);
        return {
          startLine: line + 1,
          endLine: value.split("\n").length + line,
        };
      })
      .filter((item) => item.startLine !== 0)
      .sort((a, b) => a.startLine - b.startLine)
      .map((item) => new monaco.Selection(item.startLine, 1, item.endLine, 1));

    editor.setSelections(selectionRanges);
    await editor.getAction("editor.fold")?.run();

    // Position cursor in the editable area
    editor.setPosition({ lineNumber: configStartLine + 1, column: editor.getModel()!.getLineMaxColumn(configStartLine + 1) }); // Inside the options object
    editor.focus();
  };

  async function handleEditorDidMount(
    editor: monaco.editor.IStandaloneCodeEditor,
    monaco: Monaco,
    tabId: ITabId
  ) {
    if (tabId === TabIds.H2J) {
      H2JEditorRef.current = editor;
    } else {
      J2HEditorRef.current = editor;
    }
    const model = editor.getModel()!;
    let currentDecorations: string[] = [];

    // Fold the interface definitions
    intialFoldInterfaces(editor, monaco);
    // Function to find line numbers dynamically based on content
    function findContentBoundaries() {
      const content = model.getValue();
      const lines = content.split("\n");
      const configEndLine  = content.replace(tabId === TabIds.H2J ? htmlToJsonInterfacesString : jsonToHtmlInterfacesString, "").split("\n").length

      return {
        configStartLine,
        configEndLine,
        totalLines: lines.length,
      };
    }

    // Function to ensure there's always at least one editable line
    function ensureEditableLine() {
      const content = model.getValue();
      const lines = content.split("\n");
      const { configStartLine, configEndLine } = findContentBoundaries();

      // Check if there's content between the braces
      if (configStartLine >= 0 && configEndLine >= 0) {
        const contentBetween = lines.slice(configStartLine + 1, configEndLine);
        const hasEditableContent = contentBetween.some(
          (line: string) => line.length > 0
        );

        // If no editable content, ensure at least one empty line
        if (!hasEditableContent || configEndLine - configStartLine <= 1) {
          console.log("No editable content found, adding empty line");

          // Calculate the position to insert the new line (after the const options line)
          const insertPosition = {
            lineNumber: configStartLine + 1, // Monaco uses 1-based indexing, +2 to go after const options line
            column: 1,
          };

          // Use editor operations to insert a line without replacing entire content
          const edit = {
            range: new monaco.Range(
              insertPosition.lineNumber,
              insertPosition.column,
              insertPosition.lineNumber,
              insertPosition.column
            ),
            text: "\n",
            forceMoveMarkers: true,
          };

          // Apply the edit operation
          model.pushEditOperations([], [edit], () => null);
          editor.setSelection(new monaco.Selection(insertPosition.lineNumber, model.getLineMaxColumn(insertPosition.lineNumber), insertPosition.lineNumber, model.getLineMaxColumn(insertPosition.lineNumber)))
        }
      }
    }
    

    // Function to update readonly ranges based on current content
    function updateReadonlyRanges() {
      // Ensure there's always at least one editable line
      ensureEditableLine();

      const { configStartLine, configEndLine, totalLines } = findContentBoundaries();
      const readonlyRanges = [];

      // Line 1: Comment line
      if (configStartLine > 1) {
        readonlyRanges.push(
          new monaco.Range(
            1,
            1,
            configStartLine,
            model.getLineMaxColumn(configStartLine - 1)
          )
        );
      }

      // Config closing brace
      if (configEndLine > 0) {
        readonlyRanges.push(
          new monaco.Range(
            configEndLine,
            1,
            totalLines,
            model.getLineMaxColumn(totalLines)
          )
        );
      }

      // Update decorations
      currentDecorations = model.deltaDecorations(
        currentDecorations,
        readonlyRanges.map((range) => ({
          range,
          options: {
            className: "readonly-line",
            isWholeLine: true,
            stickiness:
              monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          },
        }))
      );

    }

    // Initial setup
    updateReadonlyRanges();

    // Track content changes and update readonly ranges
    model.onDidChangeContent(() => {
      // Update readonly ranges when content changes
      setTimeout(updateReadonlyRanges, 50); // Small delay to ensure content is fully updated
    });

    // Enhanced key handler with dynamic boundaries
    editor.onKeyDown((e: IKeyboardEvent) => {
      const position = editor.getPosition()!;
      const lineNumber = position.lineNumber;
      const { configStartLine, configEndLine } = findContentBoundaries();

      // Block Select All (Ctrl/Cmd + A)
      const isSelectAll =
        e.keyCode === monaco.KeyCode.KeyA && (e.ctrlKey || e.metaKey);

      if (isSelectAll) {
        e.preventDefault();
        e.stopPropagation();
        console.log(
          "Blocked Select All to prevent accidental deletion of readonly content"
        );

        // Instead, select only the editable area
        if (configStartLine > 0 && configEndLine > 0) {
          const editableStart = { lineNumber: configStartLine + 1, column: 1 };
          const editableEnd = {
            lineNumber: configEndLine - 1,
            column: model.getLineMaxColumn(configEndLine - 1),
          };
          editor.setSelection(
            monaco.Selection.fromPositions(editableStart, editableEnd)
          );
        }
        return;
      }

      // Allow editing only within the config object content (between declaration and closing brace)
      const isInEditableArea =
        lineNumber > configStartLine && lineNumber < configEndLine;

      // Special handling for delete/backspace to prevent removing the last editable line
      const isDeleteKey =
        e.keyCode === monaco.KeyCode.Delete ||
        e.keyCode === monaco.KeyCode.Backspace;

      if (isDeleteKey && isInEditableArea) {
        // Check if this would delete the last content in the editable area
        const content = model.getValue();
        const lines = content.split("\n");
        const editableLines = lines.slice(configStartLine, configEndLine - 1);
        const hasContent = editableLines.some(
          (line: string) => line.trim().length > 0
        );

        // If this is the last content and would be deleted, prevent it
        if (!hasContent || configEndLine - configStartLine <= 2) {
          console.log("Preventing deletion of last editable content");
          // Don't prevent, but ensure a line gets added back
          setTimeout(() => ensureEditableLine(), 100);
        }
      }
      if (!isInEditableArea && e.shiftKey ) {

        e.preventDefault();
        e.stopPropagation();
        console.log(
          `Blocked edit on line ${lineNumber}, editable area: ${
            configStartLine + 1
          }-${configEndLine - 1}`
        );
      }
    });

    // Fold the interface definitions
    // Ensure editor has focus
  }

  const { state, dispatch } = useGlobalContext();
  const { htmlToJsonOptions, jsonToHtmlOptions } = state;
  const configStartLine = 2

  const htmlToJsonInterfacesString = `\n\n${TYPE_DEFS.IHtmlToJsonOptions}\n\n${TYPE_DEFS.IHtmlToJsonElementTagsAttributes}\n\n${TYPE_DEFS.IHtmlToJsonTextTags}\n\n${TYPE_DEFS.IHtmlToJsonElementTags}\n\n${TYPE_DEFS.IAnyObject}`

  const htmlToJsonValue = `// Add configuration below in the htmlToJsonOptions object\nconst htmlToJsonOptions: IHtmlToJsonOptions = ${stringify(htmlToJsonOptions,null,4)}${htmlToJsonInterfacesString}`

  const jsonToHtmlInterfacesString = `\n\n${TYPE_DEFS.IJsonToHtmlOptions}\n\n${TYPE_DEFS.IJsonToHtmlElementTags}\n\n${TYPE_DEFS.IJsonToHtmlAllowedEmptyAttributes}\n\n${TYPE_DEFS.IJsonToHtmlTextTags}\n\n${TYPE_DEFS.IAnyObject}`

  const jsonToHtmlValue = `// Add configuration below in the jsonToHtmlOptions object\nconst jsonToHtmlOptions: IJsonToHtmlOptions = ${stringify(jsonToHtmlOptions,null,4)}${jsonToHtmlInterfacesString}`

  const items: TabsProps["items"] = [
    {
      label: `HTML to JSON Options`,
      key: TabIds.H2J,
      children: (
        <Editor
          options={{ readOnly: false, wordWrap: "off" }}
          height={"50vh"}
          theme="vs-dark"
          language="typescript"
          key={`${TabIds.H2J}-${JSON.stringify(htmlToJsonOptions)}-${triggerRender}`}
          onMount={(editor, monaco) =>
            handleEditorDidMount(editor, monaco, TabIds.H2J)
          }
          defaultValue={htmlToJsonValue}
        />
      ),
    },
    {
      label: `JSON to HTML Options`,
      key: TabIds.J2H,
      children: (
        <Editor
          options={{ readOnly: false, wordWrap: "off" }}
          height={"50vh"}
          theme="vs-dark"
          language="typescript"
          onMount={(editor, monaco) =>
            handleEditorDidMount(editor, monaco, TabIds.J2H)
          }
          key={`${TabIds.J2H}-${JSON.stringify(jsonToHtmlOptions)}-${triggerRender}`}
          defaultValue={jsonToHtmlValue}
        />
      ),
    },
  ];
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
      <Button
        icon={<SettingFilled />}
        onClick={() => {
          showModal();
          setTab(TabIds.H2J);
        }}
      />
      <Button color="default" variant="solid" onClick={htmlToJson}>
        HTML to JSON
      </Button>
      <div className="params">
        <div className="input">
          <Checkbox
            id="allowNonStandardTypes"
            checked={allowNonStandard}
            onChange={() => {
              toggleNonStandard();
            }}
          >
            Allow Non Standard
          </Checkbox>
        </div>
      </div>
      <Button color="default" variant="solid" onClick={jsonToHtml}>
        JSON TO HTML
      </Button>
      <Button
        icon={<SettingFilled />}
        onClick={() => {
          showModal();
          setTab(TabIds.J2H);
        }}
      />
      <Modal
        title="Additonal Settings"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={"50vw"}
      >
        <Tabs
          onChange={onChange}
          // destroyOnHidden={true}
          animated={{
            inkBar: true,
          }}
          type="line"
          activeKey={tab}
          centered={true}
          items={items}
          onTabClick={(key) => {
            setTab(key as ITabId);
          }}
        />
      </Modal>
    </div>
  );
}

export default Footer;
