
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Users, Crown, Award, UserPlus, FileText, FileSpreadsheet } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const navItems = [
    { path: "/golden-jubilee", label: "Golden Jubilee", icon: Crown },
    { path: "/silver-jubilee", label: "Silver Jubilee", icon: Award },
    { path: "/executives", label: "Executives", icon: Users },
    { path: "/new-registration", label: "New Registration", icon: UserPlus },
    { path: "/attendance-logs", label: "Attendance Logs", icon: FileText },
    { path: "/sheets-logs", label: "Sheets Logs", icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-r from-gray-950 via-gray-900 to-black shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">CETAA Event Registration</h1>
            </div>
            <nav className="hidden md:flex space-x-6 text-sm font-medium">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-2 py-1 rounded-md transition-colors text-xs md:text-sm font-medium ${
                      isActive
                        ? "bg-blue-950 text-white shadow-sm"
                        : "text-white hover:text-blue-300 hover:bg-blue-950"
                    }`}
                    style={{ minWidth: 0 }}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden border-t bg-black">
          <div className="grid grid-cols-3 gap-1 p-1 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center p-1 rounded-md transition-colors text-[11px] font-medium ${
                    isActive
                      ? "bg-blue-950 text-white shadow-sm"
                      : "text-white hover:text-blue-300 hover:bg-blue-950"
                  }`}
                >
                  <Icon className="w-5 h-5 mb-0.5" />
                  <span className="truncate leading-tight">{item.label.split(' ').join('\n')}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
