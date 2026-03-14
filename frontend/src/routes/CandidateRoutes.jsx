import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import DesktopOnlyRoute from "../components/DesktopOnlyRoute";

import Home from "../pages/candidate/Home";
import Notes from "../pages/candidate/Notes";
import Chat from "../pages/candidate/Chat";
import Quiz from "../pages/candidate/Quiz";
import StudyPlan from "../pages/candidate/StudyPlan";
import TopicDetail from "../pages/candidate/TopicDetail";
import CodingProblems from "../pages/candidate/CodingProblems";
import ResumeAnalyzer from "../pages/candidate/ResumeAnalyzer";
import JobTracker from "../pages/candidate/JobTracker";
import CodingPractice from "../pages/candidate/CodingPractice";
import VideoFeed from "../pages/candidate/VideoFeed";
import PracticeSetup from "../components/PracticeSetup";
import InterviewDashboard from "../pages/candidate/InterviewDashboard";
import InterviewRoom from "../pages/candidate/Interview";
import Report from "../pages/candidate/Report";
import UserDashboard from "../pages/candidate/UserDashboard";
import PublicProfile from "../pages/candidate/PublicProfile";
import ProfileEdit from "../pages/candidate/ProfileEdit";
import Leaderboard from "../pages/candidate/Leaderboard";
import AppliedJobsPage from "../pages/candidate/AppliedJobsPage";
import Jobs from "../pages/candidate/Jobs";
import JobDescription from "../pages/candidate/JobDescription";
import CodingInterface from "../pages/candidate/CodingInterface";
import ContestList from "../pages/candidate/ContestList";
import CandidateAssessmentPortal from "../pages/candidate/CandidateAssessmentPortal";
import AssessmentCodingInterface from "../pages/candidate/AssessmentCodingInterface";
import CandidateContestPortal from "../pages/candidate/CandidateContestPortal";
import ContestCodingInterface from "../pages/candidate/ContestCodingInterface";

const CandidateRoutes = () => {
  return (
    <Routes>
      {/* Available on Both Devices */}
      <Route path="dashboard" element={<ProtectedRoute allowedRoles={["candidate"]}><Home /></ProtectedRoute>} />
      <Route path="notes" element={<ProtectedRoute allowedRoles={["candidate"]}><Notes /></ProtectedRoute>} />
      <Route path="chat" element={<ProtectedRoute allowedRoles={["candidate"]}><Chat /></ProtectedRoute>} />
      <Route path="quiz" element={<ProtectedRoute allowedRoles={["candidate"]}><Quiz /></ProtectedRoute>} />
      <Route path="study-plan" element={<ProtectedRoute allowedRoles={["candidate"]}><StudyPlan /></ProtectedRoute>} />
      <Route path="topic/:topicId" element={<ProtectedRoute allowedRoles={["candidate"]}><TopicDetail /></ProtectedRoute>} />
      <Route path="report/:reportId" element={<ProtectedRoute allowedRoles={["candidate"]}><Report /></ProtectedRoute>} />
      <Route path="resume-analyzer" element={<ProtectedRoute allowedRoles={["candidate"]}><ResumeAnalyzer /></ProtectedRoute>} />
      <Route path="job-tracker" element={<ProtectedRoute allowedRoles={["candidate"]}><JobTracker /></ProtectedRoute>} />
      <Route path="video-feed" element={<ProtectedRoute allowedRoles={["candidate"]}><VideoFeed /></ProtectedRoute>} />
      <Route path="profile" element={<ProtectedRoute allowedRoles={["candidate"]}><UserDashboard /></ProtectedRoute>} />
      <Route path="profile/edit" element={<ProtectedRoute allowedRoles={["candidate"]}><ProfileEdit /></ProtectedRoute>} />
      <Route path="profile/:id" element={<ProtectedRoute allowedRoles={["candidate"]}><PublicProfile /></ProtectedRoute>} />
      <Route path="applied-jobs" element={<ProtectedRoute allowedRoles={["candidate"]}><AppliedJobsPage /></ProtectedRoute>} />
      <Route path="leaderboard" element={<ProtectedRoute allowedRoles={["candidate"]}><Leaderboard /></ProtectedRoute>} />
      <Route path="jobs" element={<ProtectedRoute allowedRoles={["candidate"]}><Jobs /></ProtectedRoute>} />
      <Route path="description/:id" element={<ProtectedRoute allowedRoles={["candidate"]}><JobDescription /></ProtectedRoute>} />
      
      {/* Desktop Only Routes */}
      <Route element={<DesktopOnlyRoute />}>
        <Route path="practice" element={<ProtectedRoute allowedRoles={["candidate"]}><InterviewDashboard /></ProtectedRoute>} />
        <Route path="practice-setup" element={<ProtectedRoute allowedRoles={["candidate"]}><PracticeSetup /></ProtectedRoute>} />
        <Route path="interview" element={<ProtectedRoute allowedRoles={["candidate"]}><InterviewRoom /></ProtectedRoute>} />
        <Route path="coding-practice" element={<ProtectedRoute allowedRoles={["candidate"]}><CodingPractice /></ProtectedRoute>} />
        <Route path="coding-problems" element={<ProtectedRoute allowedRoles={["candidate"]}><CodingProblems /></ProtectedRoute>} />
        <Route path="practice/:problemId" element={<ProtectedRoute allowedRoles={["candidate"]}><CodingInterface /></ProtectedRoute>} />
        <Route path="contests" element={<ProtectedRoute allowedRoles={["candidate"]}><ContestList /></ProtectedRoute>} />
        <Route path="assessment/:assessmentId" element={<ProtectedRoute allowedRoles={["candidate"]}><CandidateAssessmentPortal /></ProtectedRoute>} />
        <Route path="assessment/:assessmentId/solve/:problemId" element={<ProtectedRoute allowedRoles={["candidate"]}><AssessmentCodingInterface /></ProtectedRoute>} />
        <Route path="contest/:contestId" element={<ProtectedRoute allowedRoles={["candidate"]}><CandidateContestPortal /></ProtectedRoute>} />
        <Route path="contest/:contestId/solve/:problemId" element={<ProtectedRoute allowedRoles={["candidate"]}><ContestCodingInterface /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
};

export default CandidateRoutes;
