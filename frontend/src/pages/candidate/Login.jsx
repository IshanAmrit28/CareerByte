// frontend/src/Pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import { login } from "../../services/authServices";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "", role: "candidate" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        userType: formData.role,
      }
      const response = await login(payload);
      loginUser(response.user);
      if (response.user.role === 'recruiter' || response.user.userType === 'recruiter') {
        navigate("/recruiter/dashboard");
      } else if (response.user.role === 'admin' || response.user.userType === 'admin') {
        navigate("/admin/dashboard");
      } else {
        navigate("/candidate/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.error || err.response?.data?.message || "Invalid credentials. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-white px-4 font-sans py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 bg-black rounded-3xl overflow-hidden shadow-2xl max-w-6xl w-full border border-gray-800">
        {/* Left Form Section */}
        <div className="flex flex-col justify-center px-6 md:px-16 py-12 md:py-16 items-center">
          <h1 className="text-4xl font-semibold mb-10 text-center">Login</h1>

          {error && (
            <div className="w-full max-w-md mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full max-w-md">
            {/* Email */}
            <div className="flex flex-col mb-6 w-full">
              <label
                htmlFor="email"
                className="text-base font-medium mb-2 text-gray-300"
              >
                Email
              </label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="text-gray-500 w-5 h-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 pr-3 py-3 w-full rounded-lg bg-[#1a1a1a] border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col mb-8 w-full">
              <label
                htmlFor="password"
                className="text-base font-medium mb-2 text-gray-300"
              >
                Password
              </label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="text-gray-500 w-5 h-5" />
                </div>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-3 py-3 w-full rounded-lg bg-[#1a1a1a] border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            {/* <div className="flex items-center justify-around bg-[#1a1a1a] p-3 mb-8 rounded-lg border border-gray-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="candidate"
                  checked={formData.role === "candidate"}
                  onChange={handleChange}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-300">Candidate</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="recruiter"
                  checked={formData.role === "recruiter"}
                  onChange={handleChange}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-300">Recruiter</span>
              </label>
            </div> */}

            <button
              type="submit"
              className="bg-[#f8e8b6] text-black font-bold text-lg py-3 rounded-lg hover:bg-[#f6de96] hover:scale-[1.01] transition-all duration-200 w-full shadow-lg mb-6"
            >
              Login
            </button>

            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-gray-800 w-full"></div>
              <span className="bg-black px-4 text-xs text-gray-500 uppercase tracking-widest whitespace-nowrap">Or continue with</span>
              <div className="border-t border-gray-800 w-full"></div>
            </div>

            <div className="flex justify-center w-full">
              <button
                type="button"
                onClick={() => {
                  window.location.href = `${import.meta.env.VITE_BACKEND_API_BASE_URL}/auth/google`;
                }}
                className="flex items-center justify-center gap-3 bg-[#1a1a1a] border border-gray-800 text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition-all duration-200 w-full max-w-md shadow-lg"
              >
                <img 
                  src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" 
                  alt="Google Logo" 
                  className="w-5 h-5"
                />
                Login with Google
              </button>
            </div>
          </form>

          <div className="mt-8 text-sm text-gray-400 text-center w-full max-w-md">
            <p>
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-400 hover:text-blue-300 hover:underline transition-colors font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Right Image Section */}
        <div className="hidden md:flex p-4">
          <div className="w-full h-full bg-[#d3c5a6] rounded-2xl overflow-hidden relative flex items-center justify-center min-h-[500px]">
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
              alt="AI Interview Illustration"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 opacity-80"
            />
          </div>
          <div className="absolute bottom-8 left-8 right-8 bg-[#111b27]/80 text-white rounded-2xl p-6 backdrop-blur-md shadow-lg border border-slate-700/50">
            <h2 className="text-xl font-bold mb-2">One Stop Career Prep</h2>
            <p className="text-sm leading-relaxed text-gray-200 font-medium">
              From AI-driven mock interviews to smart coding challenges, 
              CareerByte is your ultimate companion to master every step 
              of your professional journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default Login;
