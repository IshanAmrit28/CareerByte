import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import {
  Mic,
  MicOff,
  PhoneOff,
  Play,
  Volume2,
  Video,
  VideoOff,
  Loader2,
  FileText,
  Briefcase,
  ThumbsDown
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { endInterview } from "../services/interviewService";

const ControlButton = ({ onClick, className, children, disabled = false }) => (
  <button
    onClick={onClick}
    className={`p-3 rounded-full text-gray-900 dark:text-white transition-all duration-200 shadow-md dark:shadow-xl ${className} ${
      disabled ? "bg-gray-500 cursor-not-allowed opacity-70" : ""
    }`}
    disabled={disabled}
  >
    {children}
  </button>
);

const ParticipantTile = ({
  name,
  isMuted,
  isCameraOff,
  isSpeaking,
  avatarUrl,
}) => (
  <div
    className={`relative w-full h-full rounded-2xl flex items-center justify-center overflow-hidden border border-gray-300 dark:border-gray-700/50 backdrop-blur-md transition-all duration-300 ${isSpeaking ? "bg-gray-200 dark:bg-white dark:bg-gray-800/80 shadow-[0_0_15px_-5px_rgba(59,130,246,0.2)]" : "bg-white dark:bg-white dark:bg-gray-900/60"}`}
  >
    {isSpeaking && (
      <div className="absolute inset-0 border-2 border-blue-500/50 rounded-2xl ring-2 ring-blue-500/20 animate-pulse opacity-80 transition-all duration-300" />
    )}
    <div className="flex flex-col items-center justify-center relative z-10">
      {isCameraOff ? (
        <div
          className={`w-36 h-36 rounded-full flex items-center justify-center shadow-lg dark:shadow-2xl transition-all duration-300 ${isSpeaking ? "bg-gradient-to-br from-blue-600 to-indigo-600 scale-105" : "bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700"}`}
        >
          <span className="text-6xl font-bold text-gray-900 dark:text-white tracking-wider">
            {name.charAt(0)}
          </span>
        </div>
      ) : (
        <img
          src={avatarUrl}
          alt={`${name} avatar`}
          className={`w-48 h-48 object-cover rounded-full shadow-lg dark:shadow-2xl transition-all duration-300 ${isSpeaking ? "border-4 border-blue-500 scale-105" : "border-4 border-gray-300 dark:border-gray-700"}`}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              "https://placehold.co/192x192/4b5563/ffffff?text=AI";
          }}
        />
      )}
      {isSpeaking && (
        <div className="absolute -bottom-10 flex items-center justify-center bg-blue-500/20 px-4 py-1.5 rounded-full backdrop-blur-sm border border-blue-500/30 animate-bounce">
          <Volume2 className="w-5 h-5 text-blue-400 mr-2" />
          <span className="text-blue-300 text-sm font-medium">Speaking...</span>
        </div>
      )}
    </div>
    <div className="absolute bottom-6 left-6 flex items-center gap-3 p-2.5 px-5 bg-gray-50 dark:bg-gray-50 dark:bg-gray-950/80 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-gray-800">
      <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">{name}</span>
      {isMuted && (
        <div className="bg-red-500/20 p-1.5 rounded-lg">
          <MicOff className="w-5 h-5 text-red-500" />
        </div>
      )}
    </div>
  </div>
);

const InterviewRoom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const CANDIDATE_NAME = user?.userName || "Candidate";

  const initialReportData = location.state?.reportStructure || {
    DBMS: [],
    OS: [],
    CN: [],
    OOP: [],
    "Resume based question": [],
    ALGORITHM: [],
  };
  const initialReportId = location.state?.reportId;

  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    listening,
  } = useSpeechRecognition();

  const [reportData, setReportData] = useState(initialReportData);
  const [reportId, setReportId] = useState(initialReportId);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);
  const [interviewStatus, setInterviewStatus] = useState("idle");
  const [questionIndex, setQuestionIndex] = useState(-1);
  const [statusMessage, setStatusMessage] = useState("Click Start to begin.");
  const [error, setError] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [textAreaAnswer, setTextAreaAnswer] = useState("");

  const voicesRef = useRef([]);
  const questionIndexRef = useRef(questionIndex);
  const timerRef = useRef(null);

  const questionKeys = Object.keys(reportData).filter((key) =>
    Array.isArray(reportData[key]),
  );
  const allQuestions = questionKeys.flatMap((key) =>
    reportData[key].map((q) => ({ ...q, category: key })),
  );
  const totalQuestions = allQuestions.length;
  const currentQuestion = allQuestions[questionIndex];

  const isAlgoQuestion = currentQuestion?.category === "ALGORITHM";

  useEffect(() => {
    questionIndexRef.current = questionIndex;
  }, [questionIndex]);

  useEffect(() => {
    if (interviewStatus === "running") {
      timerRef.current = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [interviewStatus]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${
      remainingSeconds < 10 ? "0" : ""
    }${remainingSeconds}`;
  };

  const speakQuestion = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        console.warn("TTS not supported.");
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);

      const loadVoices = () => {
        voicesRef.current = window.speechSynthesis.getVoices();
      };
      loadVoices();
      const voices = voicesRef.current;

      const chosenVoice =
        voices.find(
          (v) => v.lang.includes("en-US") && v.name.includes("Google"),
        ) || voices.find((v) => v.lang.includes("en-US"));

      if (chosenVoice) utter.voice = chosenVoice;
      utter.rate = 0.95;

      utter.onstart = () => setIsInterviewerSpeaking(true);
      utter.onend = () => {
        setIsInterviewerSpeaking(false);
        resolve();
      };
      utter.onerror = (e) => {
        console.error("TTS Error:", e);
        setIsInterviewerSpeaking(false);
        resolve();
      };
      window.speechSynthesis.speak(utter);
    });
  };

  const startListening = () => {
    if (isAlgoQuestion || listening || !browserSupportsSpeechRecognition)
      return;
    try {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: "en-US" });
      setIsMicOn(true);
      setStatusMessage("Listening... Speak now.");
      setError(null);
    } catch (e) {
      console.error("Error starting recognition:", e);
      setError(`Failed to start mic: ${e.message}`);
    }
  };

  const stopListening = () => {
    if (!browserSupportsSpeechRecognition) return;
    try {
      SpeechRecognition.stopListening();
      setIsMicOn(false);
      setStatusMessage("Recording stopped.");
    } catch (e) {
      console.error("Error stopping recognition:", e);
    }
  };

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setError("Web Speech API not supported. Voice features unavailable.");
    }

    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (browserSupportsSpeechRecognition) {
        SpeechRecognition.abortListening();
      }
    };
  }, [browserSupportsSpeechRecognition]);

  const updateReportWithAnswer = (answerText) => {
    if (!currentQuestion) return;
    const { category, questionId } = currentQuestion;

    setReportData((prevData) => {
      const newReportData = { ...prevData };
      const categoryArray = [...(newReportData[category] || [])];

      const qIndex = categoryArray.findIndex(
        (q) => q.questionId === questionId,
      );

      if (qIndex !== -1) {
        categoryArray[qIndex] = {
          ...categoryArray[qIndex],
          answer: answerText,
        };
      }
      newReportData[category] = categoryArray;
      return newReportData;
    });
  };

  const handleAnswerSubmit = (finalAnswer) => {
    stopListening();

    const answerText = finalAnswer?.trim() || "(No response recorded)";
    updateReportWithAnswer(answerText);

    setStatusMessage(`Answer recorded: ${answerText.substring(0, 50)}...`);
    resetTranscript();
    setTextAreaAnswer("");

    setTimeout(askNextQuestion, 2000);
  };

  const handleTextAnswerSubmit = () => {
    if (isAlgoQuestion && interviewStatus === "running") {
      handleAnswerSubmit(textAreaAnswer);
    }
  };

  const askNextQuestion = () => {
    if (questionIndexRef.current + 1 >= totalQuestions) {
      handleEndInterview(false);
      return;
    }

    const nextIndex = questionIndexRef.current + 1;
    const nextQuestion = allQuestions[nextIndex];
    const nextQuestionText = nextQuestion.question;
    const isNextAlgo = nextQuestion.category === "ALGORITHM";

    setStatusMessage("Interviewer is speaking...");

    speakQuestion(nextQuestionText)
      .then(() => {
        setQuestionIndex(nextIndex);

        if (isNextAlgo) {
          stopListening();
          setStatusMessage(
            "Ready for your code/answer. Type and click Submit.",
          );
        } else {
          setStatusMessage("Ready for your answer. Click the mic button.");
        }
      })
      .catch((err) => {
        setError("Failed to speak question.");
        console.error(err);
      });
  };

  const handleStartInterview = async () => {
    if (interviewStatus === "running" || totalQuestions === 0) return;

    setInterviewStatus("running");
    setElapsedTime(0);
    setError(null);
    setQuestionIndex(-1);
    setTextAreaAnswer("");

    const greeting =
      "Hello, and welcome to the interview simulator. We will have a rapid fire round. for fundamental questions answer duration is 30 seconds maximum, for coding and project or resume based question there will be no time limit. So now as the rules are clear. lets start.";
    setStatusMessage("Interviewer is speaking...");

    await speakQuestion(greeting);

    askNextQuestion();
  };

  const handleMicToggle = () => {
    if (
      interviewStatus !== "running" ||
      isInterviewerSpeaking ||
      isAlgoQuestion ||
      !browserSupportsSpeechRecognition
    )
      return;

    if (isMicOn) {
      stopListening();
      handleAnswerSubmit(transcript);
    } else {
      startListening();
    }
  };

  const handleEndInterview = async (isManualStop) => {
    setInterviewStatus("submitting");
    stopListening();
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    setStatusMessage("Submitting answers for AI grading...");

    const finalReportPayload = {
      reportId: reportId,
      reportStructure: reportData,
    };

    try {
      await endInterview(finalReportPayload);

      navigate(`/report/${reportId}`, { replace: true });
    } catch (err) {
      setError(err.message || "Submission failed. Check network.");
      setInterviewStatus("idle");
      setStatusMessage("Submission failed. You can try submitting again.");
    }
  };

  if (!initialReportId || totalQuestions === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-w-[1280px]">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-2xl border border-red-500/30">
          <h1 className="text-3xl font-bold text-red-400 mb-4">
            Interview Setup Error
          </h1>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Missing vital interview data. Please start a session from the
            Practice page.
          </p>
          <button
            onClick={() => navigate("/practice")}
            className="bg-blue-600 hover:bg-blue-500 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Go to Practice Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white font-sans min-w-[1280px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-gray-950 to-gray-950">
      <div className="w-2/3 h-full p-8 flex flex-col gap-8 relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-950 to-transparent z-10 pointer-events-none"></div>
        <div className="relative z-20 mb-[-1rem]"></div>

        <div className="h-[45%] z-20 relative">
          <ParticipantTile
            name={CANDIDATE_NAME}
            isMuted={!isMicOn || isAlgoQuestion}
            isCameraOff={true}
            isSpeaking={listening && !isAlgoQuestion}
            avatarUrl="https://placehold.co/500x500/27272a/ffffff?text=CANDIDATE"
          />
        </div>
        <div className="h-[45%] z-20 relative">
          <ParticipantTile
            name="AI Interviewer"
            isMuted={false}
            isCameraOff={true}
            isSpeaking={isInterviewerSpeaking}
            avatarUrl="https://placehold.co/500x500/27272a/ffffff?text=AI+INTERVIEWER"
          />
        </div>
      </div>

      <div className="w-1/3 h-full bg-gray-100/50 dark:bg-white dark:bg-gray-900/80 backdrop-blur-xl border-l border-gray-200 dark:border-gray-800 p-8 flex flex-col justify-between shadow-lg dark:shadow-2xl relative">
        <div className="flex justify-between items-center pb-8 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1">
              Progress
            </span>
            <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              {currentQuestion
                ? `Q ${questionIndex + 1} / ${totalQuestions}`
                : "Ready"}
            </div>
          </div>
          <div className="flex flex-col items-end">

            <p className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest mb-1">
              Time Elapsed
            </p>
            <span className="text-3xl font-mono font-bold text-gray-900 dark:text-white tracking-tight">
              {formatTime(elapsedTime)}
            </span>
          </div>
        </div>

        <div className="flex-1 py-8 overflow-y-auto space-y-8 no-scrollbar">
          <div className="p-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl border border-gray-300 dark:border-gray-700/50 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-blue-400 mb-3 flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
              Interviewer
            </h3>
            <p className="text-xl text-gray-900 dark:text-gray-100 leading-relaxed font-medium">
              {currentQuestion?.question || statusMessage}
            </p>
          </div>

          {isAlgoQuestion && interviewStatus === "running" && (
            <div className="p-6 bg-gray-50 dark:bg-gray-50 dark:bg-gray-950/80 rounded-2xl border border-blue-500/30 shadow-[0_0_30px_-10px_rgba(59,130,246,0.2)] transition-all">
              <h3 className="font-bold text-sm uppercase tracking-wider text-blue-300 mb-4 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Your Code / Algorithm Answer
              </h3>
              <textarea
                className="w-full h-64 p-4 bg-white dark:bg-gray-900 text-green-400 border border-gray-300 dark:border-gray-700/80 rounded-xl font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all placeholder-gray-600"
                placeholder="// Type your algorithm, pseudo-code, or detailed explanation here..."
                value={textAreaAnswer}
                onChange={(e) => setTextAreaAnswer(e.target.value)}
              />
              <ControlButton
                onClick={handleTextAnswerSubmit}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 w-full mt-4 font-bold rounded-xl"
                disabled={!textAreaAnswer.trim()}
              >
                <FileText size={20} className="mr-2 inline" /> Submit Code
                Answer
              </ControlButton>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-900/30 border border-red-500/30 text-red-300 rounded-xl text-sm font-medium flex items-center">
              <span className="mr-3 text-xl">⚠️</span> {error}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center pt-8 border-t border-gray-200 dark:border-gray-800">
          {interviewStatus === "idle" && (
            <ControlButton
              onClick={handleStartInterview}
              className="bg-gradient-to-r from-green-600 to-emerald-500 hover:scale-105 w-full h-16 text-lg font-bold rounded-xl shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)]"
              disabled={
                totalQuestions === 0 || !browserSupportsSpeechRecognition
              }
            >
              <Play size={24} className="mr-3 inline fill-white" /> Begin
              Session
            </ControlButton>
          )}

          {interviewStatus === "running" || interviewStatus === "submitting" ? (
            <div className="w-full flex flex-col gap-4">
              {!isAlgoQuestion && (
                <div className="flex gap-4 mb-2">
                  <ControlButton
                    onClick={handleMicToggle}
                    className={`flex-1 flex justify-center items-center h-16 rounded-xl border transition-all ${
                      isMicOn
                        ? "bg-red-500/10 border-red-500/50 hover:bg-red-500/20 text-red-400 shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                    disabled={
                      isInterviewerSpeaking ||
                      interviewStatus === "submitting" ||
                      !browserSupportsSpeechRecognition
                    }
                  >
                    {isMicOn ? (
                      <>
                        <Mic size={24} className="mr-2 animate-pulse" /> Stop
                        Recording
                      </>
                    ) : (
                      <>
                        <MicOff size={24} className="mr-2" /> Start Recording
                      </>
                    )}
                  </ControlButton>

                  <ControlButton
                    onClick={() => {}}
                    className="w-16 h-16 flex justify-center items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-700 text-gray-500 rounded-xl cursor-not-allowed"
                    disabled={true}
                  >
                    <VideoOff size={24} />
                  </ControlButton>
                </div>
              )}

              <ControlButton
                onClick={() => handleEndInterview(true)}
                className="bg-red-900/40 border border-red-800 hover:bg-red-900/60 text-red-300 w-full h-14 rounded-xl font-semibold transition-all"
                disabled={interviewStatus === "submitting"}
              >
                {interviewStatus === "submitting" ? (
                  <div className="flex justify-center items-center">
                    <Loader2 className="animate-spin w-5 h-5 mr-3" /> Evaluating
                    responses...
                  </div>
                ) : (
                  <div className="flex justify-center items-center">
                    <PhoneOff size={20} className="mr-3" /> End Simulation Early
                  </div>
                )}
              </ControlButton>
            </div>
          ) : null}

          {interviewStatus === "finished" && (
            <div className="w-full space-y-4">
              <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-xl text-center">
                <p className="text-lg font-bold text-green-400 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  Session Complete
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Your AI evaluation is ready
                </p>
              </div>
              <ControlButton
                onClick={() => navigate(`/report/${reportId}`)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 w-full h-16 text-lg font-bold rounded-xl shadow-[0_0_30px_-5px_rgba(79,70,229,0.4)] transition-all"
              >
                <Briefcase size={24} className="mr-3 inline" /> View Final
                Report
              </ControlButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;
