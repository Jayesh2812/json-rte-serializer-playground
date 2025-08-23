import React, { createContext, useContext, ReactNode, useReducer, useEffect } from "react";
import { globalReducer, initialState, ACTIONS, IState, Action } from "../reducers/global.reducer";
import { finalJsonToHtml } from "../utils";



interface GlobalContextProps {
  state: IState;
  dispatch: React.Dispatch<Action>;
}

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  useEffect(() => {
    dispatch({ type: ACTIONS.SET_HTML, payload: { html: finalJsonToHtml(initialState.json, initialState.jsonToHtmlOptions) } });
  }, []);

  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
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
