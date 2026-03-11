import React, { useState, useEffect } from "react";
import { fetchAllCodingProblems, createCodingProblem, deleteCodingProblem } from "../../services/adminService";
import { SquareTerminal, PlusCircle, Trash2, Loader2, XCircle, CheckCircle2, Code2 } from "lucide-react";

const AdminCodingProblems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [jsonInput, setJsonInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    setLoading(true);
    try {
      const data = await fetchAllCodingProblems();
      setProblems(data.problems || []);
    } catch (err) {
      setError(err.message || "Failed to load coding problems");
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
      
      const res = await createCodingProblem(parsedData);
      setProblems([...problems, res.problem]);
      setJsonInput("");
      showSuccess("Coding problem added successfully.");
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError("Invalid JSON format. Please check your syntax.");
      } else {
        setError(err.message || "Failed to add coding problem");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProblem = async (id) => {
    if (!window.confirm("Delete this coding problem? This action cannot be undone.")) return;
    try {
      await deleteCodingProblem(id);
      setProblems(problems.filter((p) => p._id !== id));
      showSuccess("Coding problem deleted.");
    } catch (err) {
      setError(err.message || "Failed to delete coding problem");
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
      <div className="flex flex-col items-center justify-center py-32 text-red-500">
        <Loader2 className="w-12 h-12 mb-4 animate-spin" />
        <p className="text-lg text-gray-300">Loading coding problems...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
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

      <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2 text-red-100">
            <PlusCircle size={20} className="text-red-500" />
            Add New Coding Problem (JSON)
          </h3>
          <button
            onClick={insertTemplate}
            className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            <Code2 size={14} /> Insert Template
          </button>
        </div>
        <form onSubmit={handleCreateProblem} className="flex flex-col gap-4">
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste problem JSON here...\nMust include title, description, difficulty, timeLimit, memoryLimit, and testCases[]"
            className="w-full h-64 bg-gray-950 font-mono text-sm border border-gray-700 rounded-xl p-4 text-green-400 focus:outline-none focus:border-red-500 transition-colors"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl transition-colors flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <SquareTerminal size={18} />}
              Save Problem to Database
            </button>
          </div>
        </form>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-100">Coding Problems Bank</h2>
        <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
          {problems.length} problems
        </span>
      </div>

      <div className="space-y-3">
        {problems.length === 0 ? (
          <div className="text-gray-500 text-center py-8 bg-gray-800/20 border border-gray-800 rounded-xl">
            No coding problems found. Add one above!
          </div>
        ) : (
          problems.map((p) => (
            <div key={p._id} className="flex items-center justify-between bg-gray-800/40 rounded-xl p-4 border border-gray-700/60 transition-colors group">
              <div className="flex-1 pr-6 cursor-pointer">
                <p className="text-red-400 font-bold mb-1">{p.title}</p>
                <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                  <span className={`px-2 py-0.5 rounded ${p.difficulty === 'Easy' ? 'bg-green-900/30 text-green-400' : p.difficulty === 'Medium' ? 'bg-yellow-900/30 text-yellow-500' : 'bg-red-900/30 text-red-400'}`}>
                    {p.difficulty}
                  </span>
                  <span>Time: {p.timeLimit}s</span>
                  <span>Mem: {p.memoryLimit}MB</span>
                  {p.tags && p.tags.length > 0 && (
                    <div className="flex gap-1">
                      {p.tags.map((tag, idx) => (
                        <span key={idx} className="bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded text-[10px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDeleteProblem(p._id)}
                  className="p-2 text-gray-500 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCodingProblems;
