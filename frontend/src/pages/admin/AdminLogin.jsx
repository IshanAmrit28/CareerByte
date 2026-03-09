import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { adminLogin } from "../../services/adminService";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import AnimatedBackground from "../../components/AnimatedBackground";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
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
      const data = await adminLogin(formData);
      
      if (data.user.userType !== "admin") {
          throw new Error("Unauthorized account access. Super Admin only.");
      }

      loginUser(data.user, data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Failed to login as admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <AnimatedBackground />

      <div className="w-full max-w-md bg-gray-900/60 backdrop-blur-xl rounded-3xl border border-red-500/30 p-8 shadow-[0_0_50px_rgba(239,68,68,0.15)] relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-red-900/50 transform rotate-3">
            <Shield size={40} className="text-white" />
          </div>
          <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-600 mb-2">
            Super Admin Portal
          </h2>
          <p className="text-gray-400 font-medium">Restricted Access Login</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 text-sm flex items-start">
            <span className="font-semibold block">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 ml-1">Admin Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
              placeholder="admin@interverse.com"
            />
          </div>

          <div className="space-y-2 relative">
            <label className="text-sm font-semibold text-gray-300 ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-600/30 flex items-center justify-center ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-1"
            }`}
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : "Authenticate"}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-8 text-sm">
          New administrator?{" "}
          <Link to="/admin/signup" className="text-red-400 hover:text-red-300 font-semibold hover:underline">
            Request Access
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
