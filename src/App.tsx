import { ConfigProvider } from "antd";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const Default = React.lazy(() => import("./Default"));
const Sidebar = React.lazy(() => import("./Sidebar"));
export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#353b48",
        },
      }}
    >
      <Router>
        <Routes>
          <Route path="/sidebar" element={<Sidebar />} />
          <Route path="/" element={<Default />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}
