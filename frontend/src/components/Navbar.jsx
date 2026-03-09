import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, LogOut } from "lucide-react";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logoutUser, isAuthenticated } = useAuth();
  
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

  const navItems = [
    { name: "Dashboard", path: "/candidate/dashboard" },
    { name: "Jobs", path: "/candidate/jobs" },
    { name: "AI Chat", path: "/candidate/chat" },
    { name: "Interview", path: "/candidate/practice" },
    { name: "Roadmap", path: "/candidate/roadmap" },
    { name: "Video Feed", path: "/candidate/video-feed" },
    { name: "Notes", path: "/candidate/notes" },
    { name: "Quiz", path: "/candidate/quiz" },
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
            {isAuthenticated && navItems.map((item) => (
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

        {/* Actions (Login/Signup vs Profile Dropdown) */}
        <div className="navbar-actions relative" ref={dropdownRef}>
          {isAuthenticated ? (
            <>
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
                      navigate("/candidate/profile");
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
            </>
          ) : (
            <div className="flex items-center gap-4">
  <Link 
    to="/login" 
    className={`px-4 py-2 rounded-xl transition-all ${isActive("/login")}`}
  >
    Log In
  </Link>
  <Link
    to="/signup"
    className={`px-4 py-2 rounded-xl transition-all ${isActive("/signup")}`}
  >
    Sign Up
  </Link>
</div>
          )}
        </div>

      </div>
    </header>
  );
}

export default Navbar;
