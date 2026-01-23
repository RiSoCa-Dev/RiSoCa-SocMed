import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Scheduler from './pages/Scheduler';
import BatchScheduler from './pages/BatchScheduler';
import PlatformConnections from './pages/PlatformConnections';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-slate-900">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scheduler" element={<Scheduler />} />
            <Route path="/batch-scheduler" element={<BatchScheduler />} />
            <Route path="/connections" element={<PlatformConnections />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
