// Setup get and post to paste bin api using fetch
import { jsonToHtml, htmlToJson } from "@contentstack/json-rte-serializer";
import collapse from "collapse-whitespace";

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
    if(!response.ok){
      throw new Error(await response.text());
    }
    const result = await response.text();
    return [result];
  } catch (error) {
    return [,error];
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

    if(!response.ok){
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.text();
    return [result];
  } catch (error) {
    return [, error]
  }
};

export const finalHtmlToJson = (html: string, allowNonStandard: boolean) => {
  const htmlDomBody = new DOMParser().parseFromString(html, "text/html").body;
  collapse(htmlDomBody);
  htmlDomBody.normalize();
  const jsonValue = htmlToJson(htmlDomBody, {
    allowNonStandardTags: allowNonStandard,
  })!;
  return jsonValue;
};

export const finalJsonToHtml = (json: any, allowNonStandard: boolean) => {
  return jsonToHtml(json, { allowNonStandardTypes: allowNonStandard });
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
              [parentPath, fieldUid, index, block_uid].filter((i) => i).join('.'),
            )
          );
      }
    }
  }
  return paths;
}