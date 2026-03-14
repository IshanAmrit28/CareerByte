import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../../services/authServices";
import { fetchPublicCompanies } from "../../services/companyServices";
import { Mail, Lock, User, Briefcase, Building2, Loader2 } from "lucide-react";
import AnimatedBackground from "../../components/AnimatedBackground";

const RecruiterSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    userType: "recruiter",
  });
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingCompanies, setFetchingCompanies] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const listCompanies = async () => {
      try {
        const data = await fetchPublicCompanies();
        setCompanies(data.companies || []);
      } catch (err) {
        console.error("Failed to fetch companies:", err);
      } finally {
        setFetchingCompanies(false);
      }
    };
    listCompanies();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!formData.company) {
        setError("Please select your company.");
        return;
    }

    setLoading(true);
    try {
      const payload = {
        fullname: formData.name,
        userName: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        userType: formData.userType,
        company: formData.company,
      };

      await signup(payload);
      alert("Recruiter registration successful! Please log in.");
      navigate("/recruiter/login");
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4 font-sans relative overflow-hidden">
      <AnimatedBackground />
      <div className="grid grid-cols-1 md:grid-cols-2 bg-black/60 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl max-w-6xl w-full border border-blue-500/30 relative z-10">
        <div className="flex flex-col justify-center px-6 md:px-16 py-10 md:py-12 items-center">
            <div className="mb-4 bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-900/40">
                <Briefcase size={32} className="text-white" />
            </div>
          <h1 className="text-3xl font-extrabold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">Recruiter Onboarding</h1>
          <p className="text-gray-400 mb-8 font-medium">Join your organization's hiring team</p>

          {error && (
            <div className="w-full max-w-md mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg text-sm text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
            <div className="flex flex-col">
              <label className="text-xs font-bold mb-1.5 text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="Jane Smith"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 pr-3 py-2.5 w-full rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold mb-1.5 text-gray-400 uppercase tracking-wider ml-1">Work Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="jane@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 pr-3 py-2.5 w-full rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold mb-1.5 text-gray-400 uppercase tracking-wider ml-1">Select Company</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Building2 size={18} />
                </div>
                {fetchingCompanies ? (
                    <div className="pl-10 pr-3 py-2.5 w-full rounded-xl bg-gray-900/50 border border-gray-700 text-gray-500 flex items-center italic">
                        <Loader2 size={16} className="animate-spin mr-2" /> Loading companies...
                    </div>
                ) : (
                    <select
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="pl-10 pr-3 py-2.5 w-full rounded-xl bg-gray-900/50 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                        required
                    >
                        <option value="" disabled className="bg-gray-900">Choose your organization</option>
                        {companies.map((comp) => (
                            <option key={comp._id} value={comp._id} className="bg-gray-900">
                                {comp.name}
                            </option>
                        ))}
                    </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1.5 text-gray-400 uppercase tracking-wider ml-1">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                            <Lock size={18} />
                        </div>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            className="pl-10 pr-3 py-2.5 w-full rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                            required
                        />
                    </div>
                </div>
                <div className="flex flex-col">
                    <label className="text-xs font-bold mb-1.5 text-gray-400 uppercase tracking-wider ml-1">Confirm</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="pl-3 pr-3 py-2.5 w-full rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                        required
                    />
                </div>
            </div>

            {/* Hidden userType field */}
            <input type="hidden" name="userType" value="recruiter" />

            <button
              type="submit"
              disabled={loading}
              className={`bg-blue-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-blue-500 hover:scale-[1.01] transition-all duration-300 w-full shadow-lg shadow-blue-600/30 mt-4 flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : "Complete Registration"}
            </button>
          </form>

          <div className="mt-8 text-sm text-gray-400 text-center w-full max-w-md">
            <p className="italic">
              Already registered?{" "}
              <Link to="/recruiter/login" className="text-blue-400 hover:text-blue-300 font-bold hover:underline transiton-all">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="hidden md:flex p-4">
          <div className="w-full h-full bg-blue-900/20 rounded-2xl overflow-hidden relative flex items-center justify-center border border-blue-500/10 text-white min-h-[600px]">
            <img
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
              alt="Business Meeting"
              className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            <div className="absolute bottom-10 left-10 right-10 bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold mb-3 text-blue-400">Scale Your Hiring</h2>
              <p className="text-blue-200">Efficiently manage evaluations and assessments with our robust admin tools.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterSignup;
