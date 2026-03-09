import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { adminSignup } from "../../services/adminService";
import { Shield, Loader2, Eye, EyeOff } from "lucide-react";
import AnimatedBackground from "../../components/AnimatedBackground";

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (
      !formData.userName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // adminSignup automatically sets userType to "admin"
      const data = await adminSignup({
          userName: formData.userName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
      });
      
      loginUser(data.user, data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Admin Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <AnimatedBackground />

      <div className="w-full max-w-lg bg-gray-900/60 backdrop-blur-xl rounded-3xl border border-red-500/30 p-8 shadow-[0_0_50px_rgba(239,68,68,0.15)] relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-red-900/50 transform -rotate-3">
            <Shield size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-600 mb-2">
            Admin Registration
          </h2>
          <p className="text-gray-400 font-medium">Create a Super Admin account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 text-sm">
            <span className="font-semibold block">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 ml-1">Full Name</label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
              placeholder="Admin Name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 ml-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
              placeholder="admin@interverse.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 relative">
              <label className="text-sm font-semibold text-gray-300 ml-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-300 ml-1">Confirm</label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-600/30 flex items-center justify-center mt-4 ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-1"
            }`}
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : "Authorize & Create"}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Already an admin?{" "}
          <Link to="/admin/login" className="text-red-400 hover:text-red-300 font-semibold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminSignup;
