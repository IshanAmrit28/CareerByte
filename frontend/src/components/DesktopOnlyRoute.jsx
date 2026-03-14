import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDevice } from '../hooks/useDevice';
import { MonitorX, ArrowLeft } from 'lucide-react';

const DesktopOnlyRoute = ({ children }) => {
  const { isMobile } = useDevice();
  const navigate = useNavigate();
  const location = useLocation();

  if (isMobile) {
    let dashboardPath = '/candidate/dashboard';
    if (location.pathname.startsWith('/recruiter')) {
      dashboardPath = '/recruiter/dashboard';
    } else if (location.pathname.startsWith('/admin')) {
      dashboardPath = '/admin/dashboard';
    }

    return (
      <div 
        className="flex flex-col items-center justify-center min-h-screen text-white p-6 text-center z-[100] fixed top-0 left-0 w-full h-full"
        style={{ backgroundColor: "#0b0c10" }} // Matches the typical dark theme
      >
        <div 
          className="p-8 rounded-2xl border border-gray-800 max-w-sm w-full flex flex-col items-center shadow-2xl"
          style={{ backgroundColor: "#1f2833" }}
        >
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
            <MonitorX className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-white">Desktop Only</h2>
          <p className="text-gray-300 text-sm mb-8 leading-relaxed">
            This feature is available only on desktop for the best experience. 
            Please open this page on a laptop or desktop device.
          </p>
          <button 
            onClick={() => navigate(dashboardPath)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-colors font-medium text-sm w-full justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};

export default DesktopOnlyRoute;
