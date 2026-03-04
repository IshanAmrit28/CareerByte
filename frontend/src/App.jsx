import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./components/Navbar";
import AnimatedBackground from "./components/AnimatedBackground";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Notes from "./pages/Notes";
import Chat from "./pages/Chat";
import Quiz from "./pages/Quiz";
import StudyPlan from "./pages/StudyPlan";
import TopicDetail from "./pages/TopicDetail";
import Roadmap from "./pages/Roadmap";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import JobTracker from "./pages/JobTracker";
import CodingPractice from "./pages/CodingPractice";
import VideoFeed from "./pages/VideoFeed";
import PracticeSetup from "./components/PracticeSetup";
import InterviewDashboard from "./pages/InterviewDashboard";
import InterviewRoom from "./pages/Interview";
import Report from "./pages/Report";
import UserDashboard from "./pages/UserDashboard";
import PublicProfile from "./pages/PublicProfile";
import ProfileEdit from "./pages/ProfileEdit";
import Leaderboard from "./pages/Leaderboard";
import AdminLogin from "./pages/AdminLogin";
import AdminSignup from "./pages/AdminSignup";
import AdminDashboard from "./pages/AdminDashboard";

// Job Board Imports
import Jobs from './components/Jobs';
import JobDescription from './components/JobDescription';
import Companies from './components/recruiter/Companies';
import CompanyCreate from './components/recruiter/CompanyCreate';
import CompanySetup from './components/recruiter/CompanySetup';
import AdminJobs from "./components/recruiter/RecruiterJobs";
import PostJob from './components/recruiter/PostJob';
import Applicants from './components/recruiter/Applicants';
import JobboardProtectedRoute from './components/recruiter/ProtectedRoute';

import "./Appmain.css";

function AppContent() {
  const location = useLocation();

  const isLanding = location.pathname === "/";
  const isAuthPage = ["/login", "/signup", "/admin/login", "/admin/signup"].includes(location.pathname);
  const isInterview = location.pathname.startsWith("/interview");
  const hideNavbar = isLanding || isInterview || isAuthPage;

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
        {!hideNavbar && <Navbar />}

        <main className={!hideNavbar ? "main-content" : ""}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["candidate", "recruiter"]}><Home /></ProtectedRoute>} />
            <Route path="/notes" element={<ProtectedRoute allowedRoles={["candidate", "recruiter"]}><Notes /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute allowedRoles={["candidate", "recruiter"]}><Chat /></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute allowedRoles={["candidate", "recruiter"]}><Quiz /></ProtectedRoute>} />
            <Route path="/study-plan" element={<ProtectedRoute allowedRoles={["candidate", "recruiter"]}><StudyPlan /></ProtectedRoute>} />
            <Route path="/topic/:topicId" element={<ProtectedRoute><TopicDetail /></ProtectedRoute>} />
            <Route path="/practice" element={<ProtectedRoute><InterviewDashboard /></ProtectedRoute>} />
            <Route path="/practice-setup" element={<ProtectedRoute><PracticeSetup /></ProtectedRoute>} />
            <Route path="/interview" element={<ProtectedRoute><InterviewRoom /></ProtectedRoute>} />
            <Route path="/report/:reportId" element={<ProtectedRoute><Report /></ProtectedRoute>} />
            <Route path="/roadmap" element={<ProtectedRoute allowedRoles={["candidate", "recruiter"]}><Roadmap /></ProtectedRoute>} />
            <Route path="/resume-analyzer" element={<ProtectedRoute allowedRoles={["candidate", "recruiter"]}><ResumeAnalyzer /></ProtectedRoute>} />
            <Route path="/job-tracker" element={<ProtectedRoute allowedRoles={["candidate", "recruiter"]}><JobTracker /></ProtectedRoute>} />
            <Route path="/coding-practice" element={<ProtectedRoute allowedRoles={["candidate", "recruiter"]}><CodingPractice /></ProtectedRoute>} />
            <Route path="/video-feed" element={<ProtectedRoute allowedRoles={["candidate", "recruiter"]}><VideoFeed /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRoles={["candidate", "recruiter"]}><UserDashboard /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute allowedRoles={["candidate", "recruiter"]}><ProfileEdit /></ProtectedRoute>} />
            <Route path="/profile/:id" element={<ProtectedRoute allowedRoles={["candidate", "recruiter"]}><PublicProfile /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute allowedRoles={["candidate", "recruiter"]}><Leaderboard /></ProtectedRoute>} />
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/signup" element={<AdminSignup />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            
            {/* Job Board Routes */}
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/description/:id" element={<JobDescription />} />
            <Route path="/admin/companies" element={<JobboardProtectedRoute><Companies/></JobboardProtectedRoute>} />
            <Route path="/admin/companies/create" element={<JobboardProtectedRoute><CompanyCreate/></JobboardProtectedRoute>} />
            <Route path="/admin/companies/:id" element={<JobboardProtectedRoute><CompanySetup/></JobboardProtectedRoute>} />
            <Route path="/admin/jobs" element={<JobboardProtectedRoute><AdminJobs/></JobboardProtectedRoute>} />
            <Route path="/admin/jobs/create" element={<JobboardProtectedRoute><PostJob/></JobboardProtectedRoute>} />
            <Route path="/admin/jobs/:id/applicants" element={<JobboardProtectedRoute><Applicants/></JobboardProtectedRoute>} />
          </Routes>
        </main>
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
