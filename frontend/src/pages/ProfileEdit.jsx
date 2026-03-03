import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Save, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL as BASE_URL } from '../constants';

const API_BASE_URL = `${BASE_URL}/api`;

const ProfileEdit = () => {
  const { user, login } = useAuth(); // We might need to refresh user context after edit
  const navigate = useNavigate();
  
  const [userName, setUserName] = useState(user?.userName || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim()) {
      setError("Username cannot be empty");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/auth/update`, 
        { userName: userName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSuccess(true);
        // Quick local storage patch to reflect changes without full relogin right away if needed
        // Assuming original auth context depends on token reload or we dispatch an event.
        setTimeout(() => navigate('/profile'), 1500);
      }
    } catch (err) {
       setError(err.response?.data?.message || "Failed to update profile");
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white pt-24 px-4 md:px-8 pb-12 font-sans relative flex justify-center items-start">
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
      
      <div className="max-w-xl w-full relative z-10 space-y-8 mt-8">
         <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-gray-400 hover:text-white transition group w-max mb-4">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Profile</span>
         </button>

         <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
            <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
            <p className="text-gray-400 mb-8 border-b border-gray-800 pb-6">Update your public candidate information.</p>

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
               <div className="space-y-2">
                 <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-400" /> Display Name
                 </label>
                 <input 
                   type="text" 
                   value={userName}
                   onChange={(e) => setUserName(e.target.value)}
                   className="w-full bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                   placeholder="Enter new display name"
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
                 <p className="text-xs text-gray-500 mt-1">Email cannot be changed currently.</p>
               </div>

               <button 
                 type="submit" 
                 disabled={loading || !userName.trim() || userName === user?.userName}
                 className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
               >
                 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                 {loading ? 'Saving Changes...' : 'Save Profile'}
               </button>
            </form>
         </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
