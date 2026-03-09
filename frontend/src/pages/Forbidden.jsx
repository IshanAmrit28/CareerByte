import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Forbidden() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const dashboardRoute = user?.userType === "admin" 
    ? "/admin/dashboard" 
    : user?.userType === "recruiter" 
      ? "/recruiter/companies" 
      : "/dashboard";

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-gray-900/50 border border-red-500/20 rounded-3xl p-10 shadow-2xl backdrop-blur-sm">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-600">
            403
          </span>
        </h1>
        <h2 className="text-xl font-bold text-gray-200 mb-4">Access Denied</h2>
        
        <p className="text-gray-400 mb-8 leading-relaxed">
          You don't have permission to access this page. Please check your credentials or contact your administrator.
        </p>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={handleGoBack}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors border border-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
          
          <Link 
            to={dashboardRoute}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Home className="w-5 h-5" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Forbidden;
