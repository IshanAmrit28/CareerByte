import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDevice } from "../hooks/useDevice";
import { useAuth } from "../context/AuthContext";
import { User, LogOut, Menu, X } from "lucide-react";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logoutUser, isAuthenticated } = useAuth();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && !event.target.closest('.mobile-menu-btn')) {
         setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path) => (location.pathname === path ? "active" : "");

  const { isMobile } = useDevice();

  const allNavItems = [
    { name: "Dashboard", path: "/candidate/dashboard" },
    { name: "Jobs", path: "/candidate/jobs" },
    { name: "AI Chat", path: "/candidate/chat" },
    { name: "Interview", path: "/candidate/practice" },
    { name: "Problems", path: "/candidate/coding-problems" },
    { name: "Contests", path: "/candidate/contests" },
    { name: "Video Feed", path: "/candidate/video-feed" },
    { name: "Notes", path: "/candidate/notes" },
    { name: "Quiz", path: "/candidate/quiz" },
  ];

  const navItems = isMobile 
    ? allNavItems.filter(item => !["Interview", "Coding", "Contests"].includes(item.name))
    : allNavItems;

  return (
    <header className="minimal-navbar">
      <div className="navbar-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo - Text Only */}
        <Link to="/" className="navbar-brand">
          CareerByte
        </Link>

        {/* Mobile menu toggle */}
        {isMobile && (
          <div className="flex items-center ml-auto mr-4">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-300 hover:text-white focus:outline-none mobile-menu-btn p-2 rounded-md hover:bg-gray-800"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
          </div>
        )}

        {/* Global Navigation Links (Desktop) */}
        <nav className="navbar-nav hidden md:flex">
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
        <div className="navbar-actions relative hidden md:flex" ref={dropdownRef}>
          {isAuthenticated ? (
            <>
              <button 
                className="profile-icon-btn overflow-hidden p-0 flex items-center justify-center"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                {user?.profile?.profilePhoto ? (
                  <img src={user.profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : user?.userName ? (
                  user.userName.substring(0, 2).toUpperCase()
                ) : (
                  <User className="w-5 h-5" />
                )}
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

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#111b27] border-b border-gray-800 shadow-xl" ref={mobileMenuRef}>
          <div className="px-4 pt-2 pb-6 space-y-1 sm:px-6">
            {isAuthenticated ? (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-3 rounded-md text-base font-medium ${
                      location.pathname === item.path
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <div className="border-t border-gray-700 mt-4 pt-4 pb-2">
                  <div className="flex items-center px-3 mb-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold border border-gray-600">
                        {user?.userName ? user.userName.substring(0, 2).toUpperCase() : <User className="w-5 h-5" />}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-white">{user?.userName || "Guest"}</div>
                      <div className="text-sm font-medium text-gray-400">{user?.email || ""}</div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate("/candidate/profile");
                    }}
                    className="flex w-full items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <User className="w-5 h-5" /> Profile
                  </button>
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logoutUser();
                      navigate("/login");
                    }}
                    className="flex w-full items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <LogOut className="w-5 h-5" /> Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                 <Link 
                  to="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-center px-4 py-3 rounded-xl bg-gray-800 text-white font-medium"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-center px-4 py-3 rounded-xl bg-indigo-600 text-white font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
