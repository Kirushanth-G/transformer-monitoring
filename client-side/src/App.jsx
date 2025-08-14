import { useState } from 'react';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

function App() {
  const [activeView, setActiveView] = useState('transformers'); // For content rendering
  const [homeTabView, setHomeTabView] = useState('transformers'); // For Home component active tab

  // Handle view changes from Sidebar
  const handleViewChange = (view) => {
    setActiveView(view);
    if (view === 'transformers') {
      setHomeTabView('transformers');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Navigation - Now manages its own active state */}
      <Sidebar onViewChange={handleViewChange} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Topbar Component */}
        <Topbar />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {activeView === 'transformers' && <Home activeView={homeTabView} setActiveView={setHomeTabView} />}
          {activeView === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
}

export default App;
