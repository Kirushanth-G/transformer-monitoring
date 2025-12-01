import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import NotificationManager from '../components/NotificationManager';
import { useNotifications } from '../hooks/useNotifications';
import MaintenanceFormContainer from '../components/maintenance/MaintenanceFormContainer';

const MaintenanceReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications, removeNotification, showSuccess, showError } = useNotifications();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (location.state?.autoPrint) {
      const timer = setTimeout(() => {
        window.print();
  const { autoPrint: _autoPrint, ...rest } = location.state || {};
        navigate(location.pathname, {
          replace: true,
          state: Object.keys(rest).length ? rest : null
        });
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className='flex min-h-screen bg-[#E5E4E2]'>
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} isMobile={isMobile} />
      {isMobile && isSidebarOpen && (
        <div className='bg-opacity-50 fixed inset-0 z-40 bg-black' onClick={closeSidebar} />
      )}

      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${
          !isMobile && isSidebarOpen ? 'md:ml-64' : 'ml-0'
        }`}
      >
        <Topbar onToggleSidebar={toggleSidebar} />
        <main className='flex-1 overflow-auto p-3 sm:p-6 lg:p-10'>
          <div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-wide text-gray-500'>Inspection #{id}</p>
              <h1 className='text-2xl font-bold text-gray-900'>Maintenance Report Builder</h1>
            </div>
            <button
              onClick={() => navigate(`/inspections/${id}`)}
              className='rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50'
            >
              Back to Inspection
            </button>
          </div>

          <MaintenanceFormContainer
            inspectionId={id}
            showSuccess={showSuccess}
            showError={showError}
          />
        </main>
      </div>

      <NotificationManager notifications={notifications} removeNotification={removeNotification} />
    </div>
  );
};

export default MaintenanceReportPage;
