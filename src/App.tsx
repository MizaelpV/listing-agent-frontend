import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/" element={<div>Dashboard (coming soon)</div>} />
      </Routes>
    </BrowserRouter>
  );
}
