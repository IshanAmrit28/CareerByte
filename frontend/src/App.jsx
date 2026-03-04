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
import AppliedJobsPage from "./pages/AppliedJobsPage";

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

import CandidateLayout from "./components/CandidateLayout";
import RecruiterLayout from "./components/recruiter/RecruiterLayout";

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
          {/* Public / Auth */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />

          {/* Candidate Layout - Restrict access to candidates only */}
          <Route element={<CandidateLayout />}>
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["candidate"]}><Home /></ProtectedRoute>} />
            <Route path="/notes" element={<ProtectedRoute allowedRoles={["candidate"]}><Notes /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute allowedRoles={["candidate"]}><Chat /></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute allowedRoles={["candidate"]}><Quiz /></ProtectedRoute>} />
            <Route path="/study-plan" element={<ProtectedRoute allowedRoles={["candidate"]}><StudyPlan /></ProtectedRoute>} />
            <Route path="/topic/:topicId" element={<ProtectedRoute><TopicDetail /></ProtectedRoute>} />
            <Route path="/practice" element={<ProtectedRoute><InterviewDashboard /></ProtectedRoute>} />
            <Route path="/practice-setup" element={<ProtectedRoute><PracticeSetup /></ProtectedRoute>} />
            <Route path="/interview" element={<ProtectedRoute><InterviewRoom /></ProtectedRoute>} />
            <Route path="/report/:reportId" element={<ProtectedRoute><Report /></ProtectedRoute>} />
            <Route path="/roadmap" element={<ProtectedRoute allowedRoles={["candidate"]}><Roadmap /></ProtectedRoute>} />
            <Route path="/resume-analyzer" element={<ProtectedRoute allowedRoles={["candidate"]}><ResumeAnalyzer /></ProtectedRoute>} />
            <Route path="/job-tracker" element={<ProtectedRoute allowedRoles={["candidate"]}><JobTracker /></ProtectedRoute>} />
            <Route path="/coding-practice" element={<ProtectedRoute allowedRoles={["candidate"]}><CodingPractice /></ProtectedRoute>} />
            <Route path="/video-feed" element={<ProtectedRoute allowedRoles={["candidate"]}><VideoFeed /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRoles={["candidate"]}><UserDashboard /></ProtectedRoute>} />
            <Route path="/profile/edit" element={<ProtectedRoute allowedRoles={["candidate"]}><ProfileEdit /></ProtectedRoute>} />
            <Route path="/profile/:id" element={<ProtectedRoute allowedRoles={["candidate"]}><PublicProfile /></ProtectedRoute>} />
            <Route path="/applied-jobs" element={<ProtectedRoute allowedRoles={["candidate"]}><AppliedJobsPage /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute allowedRoles={["candidate"]}><Leaderboard /></ProtectedRoute>} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/description/:id" element={<JobDescription />} />
          </Route>

          {/* Recruiter Layout */}
          <Route path="/recruiter" element={<RecruiterLayout />}>
            <Route path="companies" element={<JobboardProtectedRoute><Companies/></JobboardProtectedRoute>} />
            <Route path="companies/create" element={<JobboardProtectedRoute><CompanyCreate/></JobboardProtectedRoute>} />
            <Route path="companies/:id" element={<JobboardProtectedRoute><CompanySetup/></JobboardProtectedRoute>} />
            <Route path="jobs" element={<JobboardProtectedRoute><AdminJobs/></JobboardProtectedRoute>} />
            <Route path="jobs/create" element={<JobboardProtectedRoute><PostJob/></JobboardProtectedRoute>} />
            <Route path="jobs/:id/applicants" element={<JobboardProtectedRoute><Applicants/></JobboardProtectedRoute>} />
          </Route>

          {/* Admin Routes - Left untouched aside from keeping them accessible */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
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
