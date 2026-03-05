import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Shield } from "lucide-react";
import "./Navbar.css"; // Reuse styling variables

function AdminNavbar() {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="minimal-navbar">
      <div className="navbar-container">
        
        {/* Brand Logo */}
        <Link to="/admin/dashboard" className="navbar-brand flex items-center gap-2">
          <Shield className="text-red-500 w-6 h-6" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-600 font-bold">
            Admin Center
          </span>
        </Link>

        {/* Global Navigation Links (Empty for Admin as they have a custom dashboard) */}
        <nav className="navbar-nav">
          <ul className="nav-list">
          </ul>
        </nav>

        {/* Actions (Profile Dropdown) */}
        <div className="navbar-actions relative" ref={dropdownRef}>
          <button 
            className="profile-icon-btn border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            {user?.userName ? user.userName.substring(0, 2).toUpperCase() : <Shield className="w-5 h-5" />}
          </button>

          {isProfileOpen && (
            <div className="profile-dropdown border border-red-500/20 bg-gray-900 shadow-xl">
              <div className="profile-dropdown-header">
                <span className="profile-dropdown-name text-gray-200">{user?.userName || "Admin"}</span>
                <span className="profile-dropdown-email text-gray-400">{user?.email || ""}</span>
              </div>
              <div className="profile-dropdown-divider bg-red-500/20"></div>
              
              <button 
                className="profile-dropdown-item text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full flex items-center gap-2 px-4 py-2"
                onClick={() => {
                  setIsProfileOpen(false);
                  logoutUser();
                  navigate("/admin/login");
                }}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default AdminNavbar;
