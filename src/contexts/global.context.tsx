import React, { createContext, useContext, useState, ReactNode } from "react";
import { finalHtmlToJson } from "../utils";


type IJSON = Record<string, unknown>;

interface GlobalContextProps {
  html: string;
  json: Record<string, IJSON>;
  allowNonStandard: boolean;
  setHtml: React.Dispatch<React.SetStateAction<string>>;
  setJson: React.Dispatch<React.SetStateAction<IJSON>>;
  setAllowNonStandard: React.Dispatch<React.SetStateAction<boolean>>;
}

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [html, setHtml] = useState("<h1>HTML</h1>");
  const [allowNonStandard, setAllowNonStandard] = useState(
    !!parseInt(new URLSearchParams(window.location.search).get("a") ?? "0")
  );
  const [json, setJson] = useState(finalHtmlToJson(html, allowNonStandard));

  return (
    <GlobalContext.Provider value={{ html, json, setHtml, setJson, allowNonStandard, setAllowNonStandard }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalContextProps => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};
