import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { SquareTerminal, PlusCircle, Trash2, Loader2, XCircle, CheckCircle2, Code2 } from "lucide-react";
import { toast } from 'react-hot-toast';
import Pagination from "../../components/shared/Pagination";

import { useAuth } from "../../context/AuthContext";

const RecruiterQuestions = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [jsonInput, setJsonInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/coding-problems');
      if (res.data.success) {
        // Show all private problems to all recruiters
        const privateProblems = res.data.problems.filter(p => p.visibilityStatus === 'private');
        setProblems(privateProblems || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load coding problems");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProblem = async (e) => {
    e.preventDefault();
    if (!jsonInput.trim()) return setError("Please enter JSON data");

    setIsSubmitting(true);
    setError("");

    try {
      const parsedData = JSON.parse(jsonInput);
      
      const res = await api.post('/coding-problems', parsedData);
      if (res.data.success) {
        setProblems([...problems, res.data.problem]);
        setJsonInput("");
        toast.success("Coding problem added successfully.");
        showSuccess("Coding problem added successfully.");
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError("Invalid JSON format. Please check your syntax.");
      } else {
        setError(err.response?.data?.message || "Failed to add coding problem");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProblem = async (id) => {
    if (!window.confirm("Delete this coding problem? This action cannot be undone.")) return;
    try {
      const res = await api.delete(`/coding-problems/${id}`);
      if (res.data.success) {
        setProblems(problems.filter((p) => p._id !== id));
        toast.success("Coding problem deleted.");
        showSuccess("Coding problem deleted.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete coding problem");
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const insertTemplate = () => {
    setJsonInput(JSON.stringify({
      "title": "Two Sum",
      "description": "Given an array of integers `nums` and an integer `target`...",
      "difficulty": "Easy",
      "tags": ["array", "hashmap"],
      "timeLimit": 2,
      "memoryLimit": 256,
      "testCases": [
        {
          "input": "4\\n2 7 11 15\\n9",
          "expectedOutput": "0 1",
          "isHidden": false
        }
      ]
    }, null, 2));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-indigo-500">
        <Loader2 className="w-12 h-12 mb-4 animate-spin" />
        <p className="text-lg text-gray-300">Loading your questions...</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#09090b] min-h-screen text-white pt-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Manage Questions</h1>
        <p className="text-gray-400">Create private coding problems for your assessments</p>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 flex items-center gap-3">
          <XCircle className="text-red-500" />
          {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-900/40 border border-emerald-500/50 text-emerald-200 p-4 rounded-xl mb-6 flex items-center gap-3">
          <CheckCircle2 className="text-emerald-500" />
          {successMsg}
        </div>
      )}

      <div className="bg-gray-900/60 rounded-2xl p-6 border border-gray-800 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-100">
            <PlusCircle size={20} className="text-indigo-500" />
            Add New Private Problem (JSON)
          </h3>
          <button
            onClick={insertTemplate}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 border border-gray-700"
          >
            <Code2 size={14} /> Insert Template
          </button>
        </div>
        <form onSubmit={handleCreateProblem} className="flex flex-col gap-4">
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste problem JSON here...\nMust include title, description, difficulty, timeLimit, memoryLimit, and testCases[]"
            className="w-full h-64 bg-black/50 font-mono text-sm border border-gray-800 rounded-xl p-4 text-indigo-300 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <SquareTerminal size={18} />}
              Save Private Problem
            </button>
          </div>
        </form>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-100">Your Private Questions</h2>
        <span className="text-sm text-gray-400 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
          {problems.length} problems
        </span>
      </div>

      <div className="space-y-3">
        {problems.length === 0 ? (
          <div className="text-gray-500 text-center py-12 bg-gray-900/40 border border-gray-800 border-dashed rounded-2xl">
            No private questions found. Create one above!
          </div>
        ) : (
          <>
            {problems
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((p) => (
                <div key={p._id} className="flex items-center justify-between bg-gray-900/60 rounded-xl p-4 border border-gray-800 transition-colors group hover:border-gray-700">
                  <div className="flex-1 pr-6 cursor-pointer">
                    <p className="text-indigo-400 font-bold mb-1 font-serif text-lg">{p.title}</p>
                    <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                      <span className={`px-2 py-0.5 rounded ${p.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' : p.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-400'}`}>
                        {p.difficulty}
                      </span>
                      <span>Time: {p.timeLimit}s</span>
                      <span>Mem: {p.memoryLimit}MB</span>
                      {p.tags && p.tags.length > 0 && (
                        <div className="flex gap-1">
                          {p.tags.map((tag, idx) => (
                            <span key={idx} className="bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded text-[10px] border border-gray-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {p.ownerId === user?._id && (
                      <button
                        onClick={() => handleDeleteProblem(p._id)}
                        className="p-2 text-gray-500 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            
            <Pagination 
              currentPage={currentPage}
              totalPages={Math.ceil(problems.length / itemsPerPage)}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default RecruiterQuestions;
