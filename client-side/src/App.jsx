import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useState, useEffect } from 'react';
import TransformersPage from './pages/TransformersPage';
import TransformerDetailPage from './pages/TransformerDetailPage';
import InspectionDetailPage from './pages/InspectionDetailPage';
import InspectionsPage from './pages/InspectionsPage';
import MaintenanceReportPage from './pages/MaintenanceReportPage';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile and handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Close sidebar on mobile when screen size changes
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(false); // Keep closed by default even on desktop
      }
    };

    // Initial check
    checkMobile();

    // Add event listener for resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <Router>
      <Routes>
        {/* Routes without main layout (sidebar + topbar) */}
        <Route path='/transformers/:id' element={<TransformerDetailPage />} />
  <Route path='/inspections/:id' element={<InspectionDetailPage />} />
  <Route path='/inspections/:id/report' element={<MaintenanceReportPage />} />

        {/* Routes with main layout */}
        <Route
          path='/*'
          element={
            <div className='flex h-screen bg-gray-100'>
              {/* Sidebar - responsive */}
              <Sidebar
                isOpen={isSidebarOpen}
                onClose={closeSidebar}
                isMobile={isMobile}
              />

              {/* Overlay for mobile when sidebar is open */}
              {isMobile && isSidebarOpen && (
                <div
                  className='bg-opacity-50 fixed inset-0 z-40 bg-black'
                  onClick={closeSidebar}
                />
              )}

              {/* Main Content */}
              <div
                className={`flex flex-1 flex-col transition-all duration-300 ${
                  !isMobile && isSidebarOpen ? 'md:ml-64' : 'ml-0'
                }`}
              >
                <Topbar onToggleSidebar={toggleSidebar} />

                {/* Main Content Area with Routes */}
                <main className='flex-1 overflow-auto'>
                  <Routes>
                    <Route
                      path='/'
                      element={<Navigate to='/transformers' replace />}
                    />
                    <Route
                      path='/transformers'
                      element={<TransformersPage />}
                    />
                    <Route path='/inspections' element={<InspectionsPage />} />
                    <Route path='/settings' element={<Settings />} />
                    <Route path='*' element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
