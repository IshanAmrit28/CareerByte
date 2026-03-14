import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../services/authServices";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, Briefcase } from "lucide-react";
import AnimatedBackground from "../../components/AnimatedBackground";

const RecruiterLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        role: "recruiter", // Enforce recruiter role
      }
      const response = await login(payload);
      
      if (response.user.role !== 'recruiter' && response.user.userType !== 'recruiter') {
          throw new Error("Access denied. This portal is for recruiters only.");
      }

      loginUser(response.user);
      navigate("/recruiter/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message || err.message || "Invalid credentials. Please try again."
      );
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4 font-sans relative overflow-hidden">
      <AnimatedBackground />
      <div className="grid grid-cols-1 md:grid-cols-2 bg-black/60 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl max-w-6xl w-full border border-blue-500/30 relative z-10">
        <div className="flex flex-col justify-center px-6 md:px-16 py-12 md:py-16 items-center">
          <div className="mb-6 bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-900/40">
            <Briefcase size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">Recruiter Portal</h1>
          <p className="text-gray-400 mb-10 font-medium">Manage your talent pipeline</p>

          {error && (
            <div className="w-full max-w-md mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg text-sm text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
            <div className="flex flex-col">
              <label htmlFor="email" className="text-sm font-semibold mb-2 text-gray-300 ml-1 italic">Work Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  id="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 pr-3 py-3.5 w-full rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="password" className="text-sm font-semibold mb-2 text-gray-300 ml-1 italic">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-3 py-3.5 w-full rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`bg-blue-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-blue-500 hover:scale-[1.02] transition-all duration-300 w-full shadow-lg shadow-blue-600/30 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? "Authenticating..." : "Recruiter Login"}
            </button>
          </form>

          <div className="mt-8 text-sm text-gray-400 text-center w-full max-w-md italic">
            <p>
              New recruiter?{" "}
              <Link to="/recruiter/signup" className="text-blue-400 hover:text-blue-300 font-bold hover:underline">
                Register Company Account
              </Link>
            </p>
          </div>
        </div>

        <div className="hidden md:flex p-4">
          <div className="w-full h-full bg-blue-900/20 rounded-2xl overflow-hidden relative flex items-center justify-center border border-blue-500/10 text-white min-h-[500px]">
            <img
              src="https://images.unsplash.com/photo-1521737706645-51cbd6612014?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
              alt="Recruitment Team"
              className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold mb-2 text-blue-400">Streamline Hiring</h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                Access centralized recruitment tools, manage team applications, and find the perfect fit for your company with our multi-tenant recruiter dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterLogin;
