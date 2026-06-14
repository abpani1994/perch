import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Map from "./pages/Map";
import VenueDetail from "./pages/VenueDetail";
import CheckIn from "./pages/CheckIn";
import Saved from "./pages/Saved";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/register" element={<Auth mode="register" />} />
            <Route path="/map" element={<Map />} />
            <Route path="/venue/:id" element={<VenueDetail />} />
            <Route path="/checkin" element={<ProtectedRoute><CheckIn /></ProtectedRoute>} />
            <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="*" element={<Landing />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}