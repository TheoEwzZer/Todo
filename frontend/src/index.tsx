import React from "react";
import { createRoot } from "react-dom/client";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Home from "./pages/home.tsx";
import Profile from "./pages/profile.tsx";

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
