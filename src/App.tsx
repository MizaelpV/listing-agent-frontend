import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";
import NewListing from "@/pages/NewListing";
import ListingPreview from "./pages/ListingPreview";
import ListingSuccess from "./pages/ListingSuccess";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/" element={<NewListing />} />
        <Route path="/listings/new" element={<NewListing />} />
        <Route path="/listings/preview" element={<ListingPreview />} />
        <Route path="/listings/success" element={<ListingSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}
