// Setup get and post to paste bin api using fetch
import { jsonToHtml, htmlToJson, IHtmlToJsonOptions, IJsonToHtmlOptions } from "@contentstack/json-rte-serializer";
import collapse from "collapse-whitespace";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import ts from "typescript";

export const pasteToBin = async (dataToStore: string) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  const urlencoded = new URLSearchParams();
  urlencoded.append("api_dev_key", process.env.PASTEBIN_API_KEY!);
  urlencoded.append("api_paste_code", dataToStore);
  urlencoded.append("api_option", "paste");

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
  };

  try {
    const response = await fetch(
      "https://pastebin.com/api/api_post.php",
      requestOptions
    );
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const result = await response.text();
    return [result];
  } catch (error) {
    return [, error];
  }
};

export const getFromBin = async (id: string) => {
  const myHeaders = new Headers();

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
  };

  try {
    const response = await fetch(
      `https://pastebin.com/raw/${id}`,
      requestOptions
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.text();
    return [result];
  } catch (error) {
    return [, error];
  }
};

export const finalHtmlToJson = (html: string, options: IHtmlToJsonOptions) => {
  const htmlDomBody = new DOMParser().parseFromString(html, "text/html").body;
  collapse(htmlDomBody);
  htmlDomBody.normalize();
  const jsonValue = htmlToJson(htmlDomBody, options);
  return jsonValue ?? {};
};

export const finalJsonToHtml = (json: any, options: IJsonToHtmlOptions = {}) => {
  return jsonToHtml(json, options);
};

function getFieldPath(
  parentPath: string,
  fieldUid: string,
  index: string = ""
) {
  const pathArray = [];

  if (parentPath) pathArray.push(parentPath);
  pathArray.push(fieldUid);
  if (index) pathArray.push(index);

  return pathArray.join(".");
}

// @ts-ignore
export function getAllJsonRtePaths(
  schema: Array<any>,
  entry: Record<string, any>,
  parentPath = ""
) {
  const paths = [];
  for (const field of schema) {
    const fieldUid = field.uid;
    const fieldValue = entry[fieldUid];

    if (!fieldValue) continue;

    const isMultiple = field.multiple;
    const isJsonRte =
      field.data_type === "json" && field.field_metadata?.allow_json_rte;
    const isGroupOrGlobal = ["group", "global_field"].includes(field.data_type);
    const isModularBlocks = field.data_type === "blocks";
    let index;

    if (isJsonRte) {
      if (isMultiple) {
        for (index of Object.keys(fieldValue)) {
          paths.push(getFieldPath(parentPath, fieldUid, index));
        }
      } else {
        paths.push(getFieldPath(parentPath, fieldUid, index));
      }
    } else if (isGroupOrGlobal) {
      if (isMultiple) {
        for (index of Object.keys(fieldValue)) {
          paths.push(
            ...getAllJsonRtePaths(
              field.schema,
              fieldValue[index],
              getFieldPath(parentPath, fieldUid, index)
            )
          );
        }
      } else {
        paths.push(
          ...getAllJsonRtePaths(
            field.schema,
            fieldValue,
            getFieldPath(parentPath, fieldUid, index)
          )
        );
      }
    } else if (isModularBlocks) {
      const blockSchemaMap = Object.fromEntries(
        field.blocks.map((block: any) => [block.uid, block.schema])
      );
      for (index of Object.keys(fieldValue)) {
        const block = fieldValue[index];
        const [block_uid] = Object.keys(block);
        if (block_uid)
          paths.push(
            ...getAllJsonRtePaths(
              blockSchemaMap[block_uid],
              fieldValue[index][block_uid],
              [parentPath, fieldUid, index, block_uid]
                .filter((i) => i)
                .join(".")
            )
          );
      }
    }
  }
  return paths;
}

export async function showFullModal() {
  if (window.iframeRef) window.iframeRef.style.opacity = 0;
  await window.postRobot?.sendToParent("goFullscreen", {
    open: true,
  });
}

export async function closeFullModal() {
  await window.postRobot?.sendToParent("goFullscreen", {
    open: false,
  });
  if (window.iframeRef) window.iframeRef.style.opacity = null;
}

function stripTypes(code: string) {
  return ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.ESNext },
  }).outputText;
}

export function extractOptions(code: string) {
  const jsCode = stripTypes(code)!;
  console.log("🚀 ~ extractOptions ~ jsCode:", jsCode);

  const ast = parse(jsCode, {
    sourceType: "module",
    plugins: ["typescript"],
  });

  let optionsObject = {};

  traverse(ast, {
    VariableDeclarator(path: any) {
      if (
        path.node.id.type === "Identifier" &&
        path.node.id.name.includes("Options")
      ) {
        const start = path.node.init.start;
        const end = path.node.init.end;
        optionsObject = eval(`(${jsCode.slice(start, end)})`);
      }
    },
  });

  return optionsObject;
}
