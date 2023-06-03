import Home from "./pages/home.tsx";
import Profile from "./pages/profile.tsx";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { createRoot } from "react-dom/client";

export default function App(): React.ReactElement {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

const rootElement: HTMLElement | null = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
