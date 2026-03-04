import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Save, ArrowLeft, Loader2, AlertCircle, CheckCircle2, Phone, BookOpen, Wrench, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL as BASE_URL } from '../constants';
import { USER_API_END_POINT } from '../utils/constant'; // From Job Board utils
import { useDispatch } from 'react-redux';
import { setUser as setReduxUser } from '../redux/authSlice';
import { toast } from 'sonner';

const API_BASE_URL = `${BASE_URL}/api`;

const ProfileEdit = () => {
  const { user, loginUser } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [input, setInput] = useState({
      fullname: user?.fullname || user?.userName || "",
      userName: user?.userName || "",
      phoneNumber: user?.phoneNumber || "",
      bio: user?.profile?.bio || "",
      skills: user?.profile?.skills?.join(",") || "",
      file: null
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const changeEventHandler = (e) => {
      setInput({ ...input, [e.target.name]: e.target.value });
  }

  const fileChangeHandler = (e) => {
      const file = e.target.files?.[0];
      setInput({ ...input, file })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.userName.trim()) {
      setError("Username cannot be empty");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("fullname", input.fullname);
      formData.append("userName", input.userName);
      formData.append("phoneNumber", input.phoneNumber);
      formData.append("bio", input.bio);
      formData.append("skills", input.skills);
      if (input.file) {
          formData.append("file", input.file);
      }

      // We use the job board's unified profile update endpoint since it handles multipart/form-data
      const response = await axios.post(`${USER_API_END_POINT}/profile/update`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
      });

      if (response.data.success) {
        setSuccess(true);
        // Sync the updated user info to context and redux
        loginUser(response.data.user);
        toast.success(response.data.message);
        setTimeout(() => navigate('/profile'), 1500);
      }
    } catch (err) {
       setError(err.response?.data?.message || err.message || "Failed to update profile");
       toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white pt-24 px-4 md:px-8 pb-12 font-sans relative flex justify-center items-start">
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
      
      <div className="max-w-2xl w-full relative z-10 space-y-8 mt-8">
         <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-gray-400 hover:text-white transition group w-max mb-4">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Profile</span>
         </button>

         <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
            <h1 className="text-3xl font-bold mb-2">Edit Candidate Profile</h1>
            <p className="text-gray-400 mb-8 border-b border-gray-800 pb-6">Update your public candidate information, skills, and resume.</p>

            {error && (
               <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3">
                 <AlertCircle className="w-5 h-5 flex-shrink-0" />
                 <p className="text-sm">{error}</p>
               </div>
            )}

            {success && (
               <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-center gap-3">
                 <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                 <p className="text-sm">Profile updated successfully! Redirecting...</p>
               </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <User className="w-4 h-4 text-indigo-400" /> Display Name
                     </label>
                     <input 
                       type="text" 
                       name="userName"
                       value={input.userName}
                       onChange={changeEventHandler}
                       className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                       placeholder="Enter display name"
                     />
                   </div>

                   <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-400" /> Full Name
                     </label>
                     <input 
                       type="text" 
                       name="fullname"
                       value={input.fullname}
                       onChange={changeEventHandler}
                       className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition"
                       placeholder="Enter full name"
                     />
                   </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-400" /> Phone Number
                     </label>
                     <input 
                       type="text" 
                       name="phoneNumber"
                       value={input.phoneNumber}
                       onChange={changeEventHandler}
                       className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
                       placeholder="Enter phone number"
                     />
                   </div>

                   <div className="space-y-2">
                     <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" /> Email Address
                     </label>
                     <input 
                       type="email" 
                       value={user?.email || ''}
                       disabled
                       className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                     />
                   </div>
               </div>

               <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-400" /> Bio Snapshot
                 </label>
                 <textarea 
                   name="bio"
                   value={input.bio}
                   onChange={changeEventHandler}
                   className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
                   placeholder="Write a brief introduction about yourself..."
                   rows="3"
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-orange-400" /> Top Skills (Comma separated)
                 </label>
                 <input 
                   type="text" 
                   name="skills"
                   value={input.skills}
                   onChange={changeEventHandler}
                   className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition"
                   placeholder="e.g. React, Node.js, Python"
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-pink-400" /> Resume / CV (PDF)
                 </label>
                 <div className="flex items-center gap-4">
                    <input 
                      type="file" 
                      accept="application/pdf"
                      id="file-upload"
                      name="file"
                      onChange={fileChangeHandler}
                      className="hidden"
                    />
                    <label 
                      htmlFor="file-upload"
                      className="cursor-pointer bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 text-gray-300 transition flex-1 text-center"
                    >
                      {input.file ? input.file.name : "Choose a new PDF file to upload"}
                    </label>
                    {user?.profile?.resume && !input.file && (
                        <a 
                          href={user.profile.resume} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 px-4 py-3 rounded-xl transition whitespace-nowrap border border-indigo-500/30"
                        >
                          View Current
                        </a>
                    )}
                 </div>
               </div>

               <button 
                 type="submit" 
                 disabled={loading}
                 className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-4 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-8 text-lg"
               >
                 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                 {loading ? 'Uploading & Saving...' : 'Save Complete Profile'}
               </button>
            </form>
         </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
