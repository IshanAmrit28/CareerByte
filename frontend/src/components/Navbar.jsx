import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, LogOut } from "lucide-react";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
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

  const isActive = (path) => (location.pathname === path ? "active" : "");

  const navItems = user?.userType === "admin" 
    ? [
        { name: "Admin Dashboard", path: "/admin/dashboard" },
      ]
    : [
        { name: "Dashboard", path: "/dashboard" },
        { name: "Jobs", path: "/jobs" },
        ...(user?.userType === "recruiter" || user?.role === "recruiter" ? [
          { name: "Companies", path: "/admin/companies" },
          { name: "Manage Jobs", path: "/admin/jobs" }
        ] : []),
        { name: "AI Chat", path: "/chat" },
        { name: "Interview", path: "/practice" },
        { name: "Roadmap", path: "/roadmap" },
        { name: "Video Feed", path: "/video-feed" },
        { name: "Notes", path: "/notes" },
        { name: "Quiz", path: "/quiz" },
      ];

  return (
    <header className="minimal-navbar">
      <div className="navbar-container">
        
        {/* Brand Logo - Text Only */}
        <Link to="/" className="navbar-brand">
          InterVerse
        </Link>

        {/* Global Navigation Links */}
        <nav className="navbar-nav">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.name} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${isActive(item.path)}`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Actions (Profile Dropdown) */}
        <div className="navbar-actions relative" ref={dropdownRef}>
          <button 
            className="profile-icon-btn"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            {user?.userName ? user.userName.substring(0, 2).toUpperCase() : <User className="w-5 h-5" />}
          </button>

          {isProfileOpen && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-header">
                <span className="profile-dropdown-name">{user?.userName || "Guest"}</span>
                <span className="profile-dropdown-email">{user?.email || ""}</span>
              </div>
              <div className="profile-dropdown-divider"></div>
              
              <button 
                className="profile-dropdown-item"
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate("/profile");
                }}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
              
              <button 
                className="profile-dropdown-item text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={() => {
                  setIsProfileOpen(false);
                  logoutUser();
                  navigate("/login");
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

export default Navbar;
