import * as mmonaco from "monaco-editor";
import type { IKeyboardEvent } from "monaco-editor";
import { ITabId, TabIds } from "../Footer";
import { TYPE_DEFS } from "../constants/json-rte-serializer";

// Function to find line numbers dynamically based on content
export function findContentBoundaries(
  model: mmonaco.editor.ITextModel,
  tabId: ITabId
) {
  const content = model.getValue();
  const lines = content.split("\n");
  const configStartLine = lines.findIndex((line) =>
    line.includes(tabId === TabIds.H2J ? "const htmlToJsonOptions" : "const jsonToHtmlOptions")
  );
  const configEndLine = content
    .replace(
      tabId === TabIds.H2J
        ? htmlToJsonInterfacesString
        : jsonToHtmlInterfacesString,
      ""
    )
    .split("\n").length;

  return {
    configStartLine,
    configEndLine,
    totalLines: lines.length,
  };
}

export const handleEditorKeyDown = (
  e: IKeyboardEvent,
  editor: mmonaco.editor.IStandaloneCodeEditor,
  tabId: ITabId
) => {
  const position = editor.getPosition()!;
  const lineNumber = position.lineNumber;
  const model = editor.getModel()!;
  const { configStartLine, configEndLine } = findContentBoundaries(
    model,
    tabId
  );

  // Block Select All (Ctrl/Cmd + A)
  const isSelectAll =
    e.keyCode === mmonaco.KeyCode.KeyA && (e.ctrlKey || e.metaKey);

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
        mmonaco.Selection.fromPositions(editableStart, editableEnd)
      );
    }
    return;
  }

  // Allow editing only within the config object content (between declaration and closing brace)
  const isInEditableArea =
    lineNumber > configStartLine && lineNumber < configEndLine;

  // Special handling for delete/backspace to prevent removing the last editable line
  const isDeleteKey =
    e.keyCode === mmonaco.KeyCode.Delete ||
    e.keyCode === mmonaco.KeyCode.Backspace;

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
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  }

  // Only block editing events when not in editable area, allow navigation
  if (!isInEditableArea) {
    // Define navigation keys that should be allowed
    const navigationKeys = [
      mmonaco.KeyCode.UpArrow,
      mmonaco.KeyCode.DownArrow,
      mmonaco.KeyCode.LeftArrow,
      mmonaco.KeyCode.RightArrow,
      mmonaco.KeyCode.PageUp,
      mmonaco.KeyCode.PageDown,
      mmonaco.KeyCode.Home,
      mmonaco.KeyCode.End,
      mmonaco.KeyCode.Escape,
      mmonaco.KeyCode.F5, // Refresh
    ];

    // Define common keyboard shortcuts that should be allowed
    const isCommonShortcut =
      // Copy, Cut, Paste
      ((e.ctrlKey || e.metaKey) &&
        (e.keyCode === mmonaco.KeyCode.KeyC ||
          e.keyCode === mmonaco.KeyCode.KeyX ||
          e.keyCode === mmonaco.KeyCode.KeyV)) ||
      // Undo, Redo
      ((e.ctrlKey || e.metaKey) && e.keyCode === mmonaco.KeyCode.KeyZ) ||
      ((e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.keyCode === mmonaco.KeyCode.KeyZ) ||
      (e.ctrlKey && e.keyCode === mmonaco.KeyCode.KeyY) ||
      // Find, Find Next, Find Previous
      ((e.ctrlKey || e.metaKey) && e.keyCode === mmonaco.KeyCode.KeyF) ||
      ((e.ctrlKey || e.metaKey) && e.keyCode === mmonaco.KeyCode.KeyG) ||
      ((e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.keyCode === mmonaco.KeyCode.KeyG) ||
      // Browser refresh
      ((e.ctrlKey || e.metaKey) && e.keyCode === mmonaco.KeyCode.KeyR) ||
      e.keyCode === mmonaco.KeyCode.F5 ||
      // Browser navigation
      ((e.ctrlKey || e.metaKey) &&
        (e.keyCode === mmonaco.KeyCode.LeftArrow ||
          e.keyCode === mmonaco.KeyCode.RightArrow)) ||
      // Tab switching
      ((e.ctrlKey || e.metaKey) && e.keyCode === mmonaco.KeyCode.Tab) ||
      ((e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.keyCode === mmonaco.KeyCode.Tab) ||
      // Window/App shortcuts
      ((e.ctrlKey || e.metaKey) && e.keyCode === mmonaco.KeyCode.KeyW) ||
      ((e.ctrlKey || e.metaKey) && e.keyCode === mmonaco.KeyCode.KeyN) ||
      ((e.ctrlKey || e.metaKey) && e.keyCode === mmonaco.KeyCode.KeyT) ||
      // Developer tools
      e.keyCode === mmonaco.KeyCode.F12 ||
      ((e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.keyCode === mmonaco.KeyCode.KeyI);

    const isNavigationKey = navigationKeys.includes(e.keyCode);
    const isModifierOnly =
      (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) &&
      (e.keyCode === mmonaco.KeyCode.Ctrl ||
        e.keyCode === mmonaco.KeyCode.Alt ||
        e.keyCode === mmonaco.KeyCode.Shift ||
        e.keyCode === mmonaco.KeyCode.Meta);

    // Block editing events but allow navigation and common shortcuts
    if (!isNavigationKey && !isModifierOnly && !isCommonShortcut) {
      e.preventDefault();
      e.stopPropagation();
      console.log(
        `Blocked edit on line ${lineNumber}, editable area: ${
          configStartLine + 1
        }-${configEndLine - 1}`
      );
    }
  }
};

export function ensureEditableLine(
  editor: mmonaco.editor.IStandaloneCodeEditor,
  tabId: ITabId
) {
  const model = editor.getModel()!;
  const content = model.getValue();
  const lines = content.split("\n");
  const { configStartLine, configEndLine } = findContentBoundaries(
    model,
    tabId
  );

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
        range: new mmonaco.Range(
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
      editor.setSelection(
        new mmonaco.Selection(
          insertPosition.lineNumber,
          model.getLineMaxColumn(insertPosition.lineNumber),
          insertPosition.lineNumber,
          model.getLineMaxColumn(insertPosition.lineNumber)
        )
      );
    }
  }
}

// Function to update readonly ranges based on current content
export function updateReadonlyRanges(
  editor: mmonaco.editor.IStandaloneCodeEditor,
  tabId: ITabId
) {
  let currentDecorations: string[] = [];

  // Ensure there's always at least one editable line
  const model = editor.getModel()!;
  ensureEditableLine(editor, tabId);

  const { configStartLine, configEndLine, totalLines } = findContentBoundaries(
    model,
    tabId
  );
  const readonlyRanges = [];

  // Line 1: Comment line
  if (configStartLine > 1) {
    readonlyRanges.push(
      new mmonaco.Range(
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
      new mmonaco.Range(
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
          mmonaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
      },
    }))
  );
}

export const intialFoldInterfaces = async (
  editor: mmonaco.editor.IStandaloneCodeEditor,
  monaco: typeof mmonaco,
  tabId: ITabId
) => {
  const model = editor.getModel()!;
  const content = model.getValue();
  const lines = content.split("\n");
  const { configStartLine } = findContentBoundaries(model, tabId);

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
  editor.setPosition({
    lineNumber: configStartLine + 1,
    column: editor.getModel()!.getLineMaxColumn(configStartLine + 1),
  }); // Inside the options object
  editor.focus();
};

export const htmlToJsonInterfacesString = `\n\n${TYPE_DEFS.IHtmlToJsonOptions}\n\n${TYPE_DEFS.IHtmlToJsonElementTagsAttributes}\n\n${TYPE_DEFS.IHtmlToJsonTextTags}\n\n${TYPE_DEFS.IHtmlToJsonElementTags}\n\n${TYPE_DEFS.IAnyObject}`;

export const jsonToHtmlInterfacesString = `\n\n${TYPE_DEFS.IJsonToHtmlOptions}\n\n${TYPE_DEFS.IJsonToHtmlElementTags}\n\n${TYPE_DEFS.IJsonToHtmlAllowedEmptyAttributes}\n\n${TYPE_DEFS.IJsonToHtmlTextTags}\n\n${TYPE_DEFS.IAnyObject}`;

export const htmlToJsonPreJsonToHtmlOptionsString = `// Add configuration below in the htmlToJsonOptions object\nconst htmlToJsonOptions: IHtmlToJsonOptions = `;

export const jsonToHtmlPreHtmlToJsonOptionsString = `// Add configuration below in the jsonToHtmlOptions object\nconst jsonToHtmlOptions: IJsonToHtmlOptions = `;