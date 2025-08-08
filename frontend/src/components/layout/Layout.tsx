import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar isCollapsed={isSidebarCollapsed} />
      </div>

      {/* Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black opacity-50" onClick={toggleMobileSidebar}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full">
            <Sidebar isCollapsed={false} />
            <button
              onClick={toggleMobileSidebar}
              className="absolute top-4 right-4 p-2 text-white hover:bg-gray-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between lg:justify-end p-4 lg:p-0">
          {/* Mobile menu button */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-200 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Desktop sidebar toggle */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:block fixed top-4 left-4 z-10 p-2 text-gray-600 hover:bg-white hover:shadow-md rounded-lg transition-all"
            style={{ left: isSidebarCollapsed ? '20px' : '260px' }}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
