import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";

import AnimatedBackground from "./components/AnimatedBackground";
import { AuthProvider } from "./context/AuthContext";

import Forbidden from "./pages/Forbidden";

import CandidateLayout from "./layouts/CandidateLayout";
import RecruiterLayout from "./layouts/RecruiterLayout";
import AdminLayout from "./layouts/AdminLayout";

import CandidateRoutes from "./routes/CandidateRoutes";
import RecruiterRoutes from "./routes/RecruiterRoutes";
import AdminRoutes from "./routes/AdminRoutes";

import Landing from "./pages/candidate/Landing";
import Login from "./pages/candidate/Login";
import Signup from "./pages/candidate/Signup";

import Dashboard from "./pages/candidate/Home";
import Profile from "./pages/candidate/UserDashboard";
import Jobs from "./pages/candidate/Jobs";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./components/NotFound";

import "./Appmain.css";

function AppContent() {
  const location = useLocation();

  return (
    <div
      className="app"
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      {/* 🔵 BACKGROUND LAYER */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <AnimatedBackground />
      </div>

      {/* 🟢 FOREGROUND CONTENT */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          minHeight: "100vh",
        }}
      >
        <Routes>
          {/* Public Auth & Landing Routes */}
          <Route element={<CandidateLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Candidate Role Protected Routes */}
            <Route path="/candidate/*" element={<CandidateRoutes />} />
            
            {/* Explicit core roots */}
            <Route element={<ProtectedRoute allowedRoles={["candidate"]} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/jobs" element={<Jobs />} />
            </Route>
          </Route>

          {/* Recruiter Routes */}
          <Route element={<RecruiterLayout />}>
            <Route path="/recruiter/*" element={<RecruiterRoutes />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminLayout />}>
            <Route path="/admin/*" element={<AdminRoutes />} />
          </Route>

          {/* Forbidden & 404 */}
          <Route path="/forbidden" element={<Forbidden />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
