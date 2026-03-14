import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, AlertCircle, CheckCircle2, User, Phone, Mail, BookOpen, Wrench, FileText, Loader2, Save, Lock, ShieldCheck, Eye } from 'lucide-react';
import { setPassword, changePassword } from '../../services/authServices';
import DocumentViewer from '../../components/shared/DocumentViewer';

const PasswordManager = () => {
   const { user, loginUser } = useAuth();
   const [pwLoading, setPwLoading] = useState(false);
   const [pwData, setPwData] = useState({
      oldPassword: "",
      newPassword: "",
      confirmPassword: ""
   });

   const handlePwChange = (e) => {
      setPwData({ ...pwData, [e.target.name]: e.target.value });
   };

   const handlePasswordSubmit = async (e) => {
      e.preventDefault();
      if (pwData.newPassword !== pwData.confirmPassword) {
         toast.error("Passwords do not match");
         return;
      }

      setPwLoading(true);
      try {
         let response;
         if (user?.hasPassword) {
            response = await changePassword({
               oldPassword: pwData.oldPassword,
               newPassword: pwData.newPassword,
               confirmPassword: pwData.confirmPassword
            });
         } else {
            response = await setPassword({
               password: pwData.newPassword,
               confirmPassword: pwData.confirmPassword
            });
         }

         if (response.success) {
            toast.success(response.message);
            setPwData({ oldPassword: "", newPassword: "", confirmPassword: "" });
            // If we just set a password, update the user object locally
            if (!user.hasPassword) {
               loginUser({ ...user, hasPassword: true });
            }
         }
      } catch (err) {
         toast.error(err.response?.data?.message || "Failed to update password");
      } finally {
         setPwLoading(false);
      }
   };

   return (
      <div className="space-y-4 bg-gray-800/30 p-6 rounded-2xl border border-gray-800/50">
         <div className="space-y-4">
            {user?.hasPassword && (
               <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 ml-1">Current Password</label>
                  <input 
                     type="password" 
                     name="oldPassword"
                     value={pwData.oldPassword}
                     onChange={handlePwChange}
                     className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                     placeholder="••••••••"
                     required
                  />
               </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 ml-1">New Password</label>
                  <input 
                     type="password" 
                     name="newPassword"
                     value={pwData.newPassword}
                     onChange={handlePwChange}
                     className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                     placeholder="••••••••"
                     required
                  />
               </div>
               <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400 ml-1">Confirm New Password</label>
                  <input 
                     type="password" 
                     name="confirmPassword"
                     value={pwData.confirmPassword}
                     onChange={handlePwChange}
                     className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                     placeholder="••••••••"
                     required
                  />
               </div>
            </div>
            <button 
               type="button" 
               onClick={handlePasswordSubmit}
               disabled={pwLoading}
               className="flex items-center gap-2 px-6 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl text-sm font-semibold transition disabled:opacity-50"
            >
               {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
               {user?.hasPassword ? "Update Password" : "Save Password"}
            </button>
         </div>
      </div>
   );
};

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
      profilePhoto: null,
      resume: null
  });

  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState({ url: '', name: '' });

  const openResume = (e) => {
      e.preventDefault();
      const url = input.resume ? URL.createObjectURL(input.resume) : user.profile.resume;
      const name = input.resume ? input.resume.name : (user.profile.resumeOriginalName || 'Resume.pdf');
      setSelectedResume({ url, name });
      setViewerOpen(true);
  };

  const [previews, setPreviews] = useState({
      profilePhoto: user?.profile?.profilePhoto || ""
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const changeEventHandler = (e) => {
      setInput({ ...input, [e.target.name]: e.target.value });
  }

  const fileChangeHandler = (e) => {
      const field = e.target.name;
      const file = e.target.files?.[0];
      if (file) {
          setInput({ ...input, [field]: file });
          if (field === 'profilePhoto') {
              const reader = new FileReader();
              reader.onloadend = () => {
                  setPreviews({ ...previews, profilePhoto: reader.result });
              };
              reader.readAsDataURL(file);
          }
      }
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
      if (input.profilePhoto) {
          formData.append("profilePhoto", input.profilePhoto);
      }
      if (input.resume) {
          formData.append("resume", input.resume);
      }

      const response = await api.post(`/user/profile/update`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setSuccess(true);
        // Sync the updated user info to context and redux
        loginUser(response.data.user);
        toast.success(response.data.message);
        setTimeout(() => navigate('/candidate/profile'), 1500);
      }
    } catch (err) {
       setError(err.response?.data?.message || err.message || "Failed to update profile");
       toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white pt-24 px-4 md:px-8 pb-12 font-sans relative flex justify-center items-start">
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
      
      <div className="max-w-2xl w-full relative z-10 space-y-8 mt-8">
         <button onClick={() => navigate('/candidate/profile')} className="flex items-center gap-2 text-gray-400 hover:text-white transition group w-max mb-4">
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
               {/* Profile Photo Upload Section */}
               <div className="flex flex-col items-center justify-center mb-8">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500/30 bg-gray-800 flex items-center justify-center shadow-xl">
                       {previews.profilePhoto ? (
                         <img src={previews.profilePhoto} alt="Profile Preview" className="w-full h-full object-cover" />
                       ) : (
                         <User className="w-16 h-16 text-gray-600" />
                       )}
                    </div>
                    <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 p-2 rounded-full cursor-pointer shadow-lg transition-all transform group-hover:scale-110">
                       <Save className="w-4 h-4 text-white" />
                       <input 
                         type="file" 
                         id="photo-upload" 
                         name="profilePhoto" 
                         accept="image/*" 
                         onChange={fileChangeHandler} 
                         className="hidden" 
                       />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 italic text-center">Click the icon to upload a new profile picture</p>
               </div>

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
                   rows={3}
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
                 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <input 
                      type="file" 
                      accept="application/pdf"
                      id="resume-upload"
                      name="resume"
                      onChange={fileChangeHandler}
                      className="hidden"
                    />
                    <label 
                      htmlFor="resume-upload"
                      className="cursor-pointer bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 text-gray-300 transition flex-1 text-center"
                    >
                      {input.resume ? input.resume.name : "Choose a new PDF file to upload"}
                    </label>
                    {(user?.profile?.resume || input.resume) && (
                        <button 
                          onClick={openResume}
                          className="w-full sm:w-auto bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 px-4 py-3 rounded-xl transition whitespace-nowrap border border-indigo-500/30 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          View {input.resume ? 'New' : 'Current'}
                        </button>
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

            {/* Password Management Section */}
            <div className="mt-12 pt-8 border-t border-gray-800">
               <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                 <Lock className="w-5 h-5 text-yellow-500" /> 
                 {user?.hasPassword ? "Change Password" : "Set Your Password"}
               </h2>
               <p className="text-sm text-gray-400 mb-6 font-medium">
                 {user?.hasPassword 
                   ? "Update your existing account password below." 
                   : "Your account was created via Google. Set a password to enable manual login."}
               </p>
               
          <PasswordManager />
       </div>
    </div>
    <DocumentViewer 
       isOpen={viewerOpen} 
       onClose={() => setViewerOpen(false)} 
       fileUrl={selectedResume.url ? (selectedResume.url.startsWith('blob:') ? selectedResume.url : encodeURI(selectedResume.url)) : ''} 
       fileName={selectedResume.name} 
    />
  </div>
    </div>
  );
};

export default ProfileEdit;
