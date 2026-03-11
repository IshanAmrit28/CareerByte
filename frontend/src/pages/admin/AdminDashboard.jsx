import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Users, Database, Building2, SquareTerminal } from "lucide-react";
import AnimatedBackground from "../../components/AnimatedBackground";

const AdminDashboard = () => {
  const location = useLocation();

  const navItems = [
    { id: "users", label: "User Overview", icon: Users, path: "/admin/users" },
    { id: "questions", label: "Question Database", icon: Database, path: "/admin/questions" },
    { id: "companies", label: "Company Management", icon: Building2, path: "/admin/companies" },
    { id: "coding-problems", label: "Coding Problems", icon: SquareTerminal, path: "/admin/coding-problems" },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans relative">
      <AnimatedBackground />

      <div className="max-w-6xl mx-auto relative z-10 pt-28 px-8 pb-12">
        {/* Custom Tabs / Navigation */}
        <div className="flex gap-4 mb-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Support both /admin/path and /admin/dashboard/path for active state
            const isActive = location.pathname.startsWith(item.path) || 
                           location.pathname.startsWith(`/admin/dashboard/${item.id}`) ||
                           (item.id === 'users' && location.pathname === '/admin/dashboard');
            
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive: linkActive }) => `flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  isActive || linkActive
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                    : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon size={20} />
                {item.label}
              </NavLink>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="bg-gray-900/40 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl min-h-[400px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
