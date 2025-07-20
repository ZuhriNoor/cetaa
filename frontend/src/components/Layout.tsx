
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">CETAA Event Registration</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden border-t bg-white">
          <div className="grid grid-cols-4 gap-1 p-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center p-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-center leading-tight">{item.label.split(' ').join('\n')}</span>
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
