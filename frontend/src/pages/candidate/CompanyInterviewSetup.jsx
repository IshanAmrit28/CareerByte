import React, { useState, useRef, useEffect } from "react";
import { X, Upload, Play, Loader2, Briefcase, Info } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { startInterview } from "../../services/interviewService";
import { getJobById } from "../../services/jobServices";
import { toast } from "sonner";
import "./CompanyInterviewSetup.css";

const CompanyInterviewSetup = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");
  const applicationId = searchParams.get("applicationId");
  
  const [job, setJob] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingJob, setFetchingJob] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) {
        setError("Missing Job ID. Please return to the dashboard.");
        setFetchingJob(false);
        return;
      }
      try {
        const res = await getJobById(jobId);
        if (res.data.success) {
          setJob(res.data.job);
        } else {
          setError("Failed to fetch job details.");
        }
      } catch (err) {
        console.error("Error fetching job:", err);
        setError("Error loading job information.");
      } finally {
        setFetchingJob(false);
      }
    };
    fetchJobDetails();
  }, [jobId]);

  const onClose = () => navigate("/candidate/applied-jobs");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit.");
      setResumeFile(null);
      return;
    }
    setResumeFile(file);
    setError(null);
  };

  const handleStart = async (e) => {
    e.preventDefault();
    setError(null);

    if (!resumeFile) {
      toast.error("Please upload your resume to continue.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("role", job.title);
      formData.append("jobDescription", job.description);
      formData.append("resumeFile", resumeFile);
      formData.append("applicationId", applicationId);
      formData.append("isCompanyInterview", "true");

      const result = await startInterview(formData);

      // Navigate to the interview room
      navigate("/candidate/interview", {
        state: {
          reportId: result.reportId,
          reportStructure: result.reportStructure,
        },
      });
    } catch (err) {
      console.error("Interview Start Failed:", err);
      setError(err.message || "Failed to start interview. Please try again.");
      toast.error("Could not initialize interview session.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingJob) {
    return (
      <div className="setup-container">
        <Loader2 size={48} className="spinner text-blue-500" />
        <p className="mt-4 text-gray-400">Loading interview details...</p>
      </div>
    );
  }

  return (
    <div className="setup-container">
      <div className="orb-1"></div>
      <div className="orb-2"></div>

      <div className="setup-card">
        <button onClick={onClose} className="btn-close" aria-label="Close setup">
          <X size={26} />
        </button>
        
        <div className="setup-header">
          <h1 className="setup-title">Technical Interview</h1>
          <p className="setup-subtitle">Prepare for your interview with {job?.company?.name || "the company"}</p>
        </div>

        {error && (
          <div className="error-alert">
            <span className="error-icon">⚠️</span> 
            <span>{error}</span>
          </div>
        )}

        <div className="job-info-card mb-8 p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                    <Briefcase size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white mb-1">{job?.title}</h2>
                    <p className="text-gray-400 text-sm line-clamp-3">{job?.description}</p>
                </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-blue-300 bg-blue-500/10 w-fit px-3 py-1.5 rounded-full">
                <Info size={14} />
                <span>AI will tailor questions based on this role and your resume.</span>
            </div>
        </div>

        <form className="setup-form" onSubmit={handleStart}>
          <div className="form-group">
            <label className="form-label">Upload Your Latest Resume</label>
            <p className="form-helper">This helps the AI understand your background and ask relevant questions.</p>
            <div
              className={`upload-area ${resumeFile ? "has-file" : ""}`}
              onClick={() => fileInputRef.current.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                style={{ display: "none" }}
              />
              <div className="upload-icon-wrapper">
                <Upload size={40} />
              </div>
              {resumeFile ? (
                <div>
                  <p className="upload-text-main">{resumeFile.name}</p>
                  <p className="upload-text-sub">Selected for upload</p>
                </div>
              ) : (
                <p className="upload-text-default">Click to browse your resume</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn-start"
            disabled={loading || error}
          >
            <div className="btn-shine"></div>
            {loading ? (
              <>
                <Loader2 size={24} className="spinner" />
                Initializing Technical Session...
              </>
            ) : (
              <>
                <Play size={24} fill="currentColor" />
                Start Technical Interview
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompanyInterviewSetup;
