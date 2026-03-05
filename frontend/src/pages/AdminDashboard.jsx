import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  fetchAllUsers,
  fetchAllQuestions,
  createQuestion,
  deleteQuestion,
  updateQuestionCategory,
} from "../services/adminService";
import {
  Users,
  Database,
  Trash2,
  PlusCircle,
  Shield,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  FolderOpen
} from "lucide-react";
import AnimatedBackground from "../components/AnimatedBackground";
import AdminNavbar from "../components/AdminNavbar";

const CATEGORIES = ["DBMS", "OS", "CN", "OOP", "RESUME", "ALGORITHM"];

const AdminDashboard = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users"); // 'users' or 'questions'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Data states
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);

  // Form states for new question
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionCategory, setNewQuestionCategory] = useState("DBMS");
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    loadData();
    setSelectedCategory(null);
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      if (activeTab === "users") {
        const data = await fetchAllUsers();
        setUsers(data.users || []);
      } else if (activeTab === "questions") {
        const data = await fetchAllQuestions();
        setQuestions(data.questions || []);
      }
    } catch (err) {
      setError(err.message || `Failed to load ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    try {
      const res = await createQuestion({
        question: newQuestionText,
        category: newQuestionCategory,
      });
      setQuestions([...questions, res.question]);
      setNewQuestionText("");
      showSuccess("Question successfully added to database.");
    } catch (err) {
      setError(err.message || "Failed to add question");
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await deleteQuestion(id);
      setQuestions(questions.filter((q) => q._id !== id));
      showSuccess("Question deleted.");
    } catch (err) {
      setError(err.message || "Failed to delete question");
    }
  };

  const handleUpdateCategory = async (id, newCategory) => {
    try {
      const res = await updateQuestionCategory(id, newCategory);
      setQuestions(
        questions.map((q) => (q._id === id ? { ...q, category: res.question.category } : q))
      );
      showSuccess("Category updated.");
    } catch (err) {
      setError(err.message || "Failed to update category");
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white font-sans relative">
      <AdminNavbar />
      <AnimatedBackground />

      <div className="max-w-6xl mx-auto relative z-10 pt-28 px-8 pb-12">


        {/* Global Notifications */}
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

        {/* Custom Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === "users"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <Users size={20} />
            User Overview
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === "questions"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <Database size={20} />
            Question Database
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-gray-900/40 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 text-red-500">
              <Loader2 className="w-12 h-12 mb-4 animate-spin" />
              <p className="text-lg text-gray-300">Synchronizing secure data...</p>
            </div>
          ) : activeTab === "users" ? (
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-100">Registered Users</h2>
                <div className="flex items-center bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
                  <Search size={18} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="bg-transparent border-none text-white focus:outline-none w-48 text-sm"
                    disabled
                    title="Search is not implemented in this demo"
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto rounded-xl border border-gray-700/50">
                <table className="w-full text-left">
                  <thead className="bg-gray-800/80 text-gray-400 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-4 rounded-tl-xl font-semibold">User ID</th>
                      <th className="p-4 font-semibold">Name</th>
                      <th className="p-4 font-semibold">Email</th>
                      <th className="p-4 font-semibold">Role</th>
                      <th className="p-4 rounded-tr-xl font-semibold">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50 text-sm">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-10 text-center text-gray-500">
                          No users found in the system.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u._id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="p-4 text-gray-500 font-mono text-xs">{u._id}</td>
                          <td className="p-4 font-medium text-gray-200">{u.userName}</td>
                          <td className="p-4 text-gray-400">{u.email}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              u.userType === 'recruiter' 
                                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
                                : 'bg-green-500/20 text-green-400 border border-green-500/30'
                            }`}>
                              {u.userType.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4 text-gray-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-8">
              {!selectedCategory ? (
                <>
                  <div className="flex items-center gap-3 mb-8">
                    <FolderOpen size={28} className="text-red-500" />
                    <h2 className="text-2xl font-bold text-gray-100">Question Categories</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {CATEGORIES.map((category) => {
                      const categoryCount = questions.filter(q => q.category === category).length;
                      return (
                        <div
                          key={category}
                          onClick={() => {
                            setSelectedCategory(category);
                            setNewQuestionCategory(category);
                          }}
                          className="bg-gray-800/40 border border-gray-700 hover:border-red-500/50 rounded-2xl p-6 cursor-pointer transition-all hover:bg-gray-800/60 group shadow-lg"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-200 group-hover:text-red-400 transition-colors">
                              {category}
                            </h3>
                            <span className="bg-gray-900 text-gray-400 px-3 py-1 rounded-full text-xs font-mono border border-gray-700">
                              {categoryCount} Qs
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Manage questions for {category} interviews.
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setSelectedCategory(null)} 
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors px-4 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg w-max"
                  >
                    <ArrowLeft size={16} /> Back to Categories
                  </button>

                  {/* Question Addition Form (Pre-selected Category) */}
                  <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 mb-8">
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-red-100">
                      <PlusCircle size={20} className="text-red-500"/>
                      Add New {selectedCategory} Question
                    </h3>
                    <form onSubmit={handleAddQuestion} className="flex gap-4">
                      <input
                        type="text"
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                        placeholder={`Enter full ${selectedCategory} interview question here...`}
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                      />
                      <select
                        value={newQuestionCategory}
                        onChange={(e) => setNewQuestionCategory(e.target.value)}
                        className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 font-semibold cursor-pointer w-40"
                        disabled
                      >
                        <option value={selectedCategory}>{selectedCategory}</option>
                      </select>
                      <button
                        type="submit"
                        className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
                      >
                        Add to DB
                      </button>
                    </form>
                  </div>

                  {/* Question List Filtered by Category */}
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-100">{selectedCategory} Question Bank</h2>
                    <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                      {questions.filter(q => q.category === selectedCategory).length} items
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {questions.filter(q => q.category === selectedCategory).length === 0 ? (
                      <div className="text-center py-10 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
                        <p className="text-gray-500">No questions exist in the {selectedCategory} category.</p>
                      </div>
                    ) : (
                      questions
                        .filter(q => q.category === selectedCategory)
                        .map((q) => (
                        <div key={q._id} className="flex items-center justify-between bg-gray-800/40 rounded-xl p-4 border border-gray-700/60 hover:border-gray-600 transition-colors group">
                          <div className="flex-1 pr-6">
                            <p className="text-gray-200 font-medium">{q.question}</p>
                            <p className="text-xs text-gray-500 mt-1 font-mono">ID: {q._id}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <select
                              value={q.category}
                              onChange={(e) => handleUpdateCategory(q._id, e.target.value)}
                              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-red-500 cursor-pointer"
                            >
                              {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleDeleteQuestion(q._id)}
                              className="p-2 text-gray-500 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-colors"
                              title="Delete Question"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
