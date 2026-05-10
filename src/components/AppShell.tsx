import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from '../pages/Dashboard';
import Scheduler from '../pages/Scheduler';
import PlatformConnections from '../pages/PlatformConnections';

export default function AppShell() {
  return (
    <Router>
      <div className="min-h-screen bg-transparent text-white lg:flex">
        <Sidebar />
        <main className="min-w-0 flex-1 pb-16 pt-2 text-[13px] lg:h-screen lg:overflow-y-auto lg:pb-0 lg:pt-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scheduler" element={<Scheduler />} />
            <Route path="/connections" element={<PlatformConnections />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
