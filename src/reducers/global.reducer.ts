import {
  IHtmlToJsonOptions,
  IJsonToHtmlOptions,
} from "@contentstack/json-rte-serializer";

import * as z from "zod";

// Zod schemas for function signatures that match the library types
const jsonToHtmlElementTagFn = z.function()
  .args(z.string(), z.string(), z.any(), z.object({}).optional())
  .returns(z.string());

const jsonToHtmlTextTagFn = z.function()
  .args(z.any(), z.any())
  .returns(z.string());

const htmlToJsonElementTagFn = z.function()
  .args(z.any()) // HTMLElement
  .returns(z.object({
    type: z.string(),
    attrs: z.any(),
    uid: z.string().optional(),
  }));

const htmlToJsonTextTagFn = z.function()
  .args(z.any()) // HTMLElement  
  .returns(z.any()); // IAnyObject

export const jsonToHtmlOptionsSchema = z.object({
  allowNonStandardTypes: z.boolean().optional(),
  customElementTypes: z.record(z.string(), jsonToHtmlElementTagFn).optional(),
  customTextWrapper: z.record(z.string(), jsonToHtmlTextTagFn).optional(),
  allowedEmptyAttributes: z.record(z.string(), z.array(z.string())).optional(),
  addNbspForEmptyBlocks: z.boolean().optional(),
}) as z.ZodType<IJsonToHtmlOptions>;

export const htmlToJsonOptionsSchema: z.ZodType<IHtmlToJsonOptions> = z.object({
  allowNonStandardTags: z.boolean().optional(),
  customElementTags: z.record(z.string(), htmlToJsonElementTagFn).optional(),
  customTextTags: z.record(z.string(), htmlToJsonTextTagFn).optional(),
  addNbspForEmptyBlocks: z.boolean().optional(),
}) as z.ZodType<IHtmlToJsonOptions>;


export interface IState {
  html: string;
  json: Record<string, unknown>;
  jsonToHtmlOptions: z.infer<typeof jsonToHtmlOptionsSchema>;
  htmlToJsonOptions: z.infer<typeof htmlToJsonOptionsSchema>;
}

export const initialState: IState = {
  html: "<h1>HTML</h1>",
  json: {"type":"doc","uid":"811dd4a2d4204a49a378b7ada941f95d","attrs":{},"children":[{"type":"h1","attrs":{},"uid":"cfbde038e32749f4a69f00bd18d8da64","children":[{"text":"HTML"}]}]},
  jsonToHtmlOptions: {},
  htmlToJsonOptions: {},
};

export const ACTIONS = {
  SET_HTML: "SET_HTML",
  SET_JSON: "SET_JSON",
  SET_JSON_TO_HTML_OPTIONS: "SET_JSON_TO_HTML_OPTIONS",
  SET_HTML_TO_JSON_OPTIONS: "SET_HTML_TO_JSON_OPTIONS",
  SET_ALLOW_NON_STANDARD: "SET_ALLOW_NON_STANDARD",
} as const;

interface ISetHtml {
  type: typeof ACTIONS.SET_HTML;
  payload: {
    html: string;
  };
}

interface ISetJsonToHtmlOptions {
  type: typeof ACTIONS.SET_JSON_TO_HTML_OPTIONS;
  payload: IJsonToHtmlOptions;
}

interface ISetAllowNonStandard {
  type: typeof ACTIONS.SET_ALLOW_NON_STANDARD;
  payload: {
    allowNonStandard: boolean;
  };
}

type ISetJson = {
  type: typeof ACTIONS.SET_JSON;
  payload: {
    json: Record<string, unknown>;
  };
};

interface ISetHtmlToJsonOptions {
  type: typeof ACTIONS.SET_HTML_TO_JSON_OPTIONS;
  payload: IHtmlToJsonOptions;
}

export type Action =
  | ISetHtml
  | ISetJson
  | ISetJsonToHtmlOptions
  | ISetHtmlToJsonOptions
  | ISetAllowNonStandard;

export const globalReducer = (state: IState, action: Action): IState => {
  switch (action.type) {
    case ACTIONS.SET_HTML:
      const { html } = action.payload;
      return { ...state, html };
    case ACTIONS.SET_JSON:
      const { json } = action.payload;
      return { ...state, json };
    case ACTIONS.SET_JSON_TO_HTML_OPTIONS:
      return { ...state, jsonToHtmlOptions: action.payload };
    case ACTIONS.SET_HTML_TO_JSON_OPTIONS:
      return { ...state, htmlToJsonOptions: action.payload };
    case ACTIONS.SET_ALLOW_NON_STANDARD:
      const { allowNonStandard } = action.payload;
      return {
        ...state,
        htmlToJsonOptions: {
          ...state.htmlToJsonOptions,
          allowNonStandardTags: allowNonStandard,
        },
        jsonToHtmlOptions: {
          ...state.jsonToHtmlOptions,
          allowNonStandardTypes: allowNonStandard,
        },
      };
    default:
      return state;
  }
};
