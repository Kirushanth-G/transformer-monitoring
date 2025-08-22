import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import TransformersPage from './pages/TransformersPage';
import TransformerDetailPage from './pages/TransformerDetailPage';
import InspectionsPage from './pages/InspectionsPage';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes without main layout (sidebar + topbar) */}
        <Route path='/transformers/:id' element={<TransformerDetailPage />} />

        {/* Routes with main layout */}
        <Route
          path='/*'
          element={
            <div className='flex h-screen bg-gray-100'>
              {/* Always visible */}
              <Sidebar />

              {/* Main Content */}
              <div className='ml-64 flex flex-1 flex-col'>
                <Topbar />

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
