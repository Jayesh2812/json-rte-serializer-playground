import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Default from "./Default";
import Sidebar from "./Sidebar";
export default function App() {
  return (
    <Router>
        <Routes>
          <Route path="/sidebar" element={<Sidebar />} />
          <Route path="/" element={<Default />} />
        </Routes>
    </Router>
  );
}

