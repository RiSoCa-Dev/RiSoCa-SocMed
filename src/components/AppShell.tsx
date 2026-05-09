import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from '../pages/Dashboard';
import Scheduler from '../pages/Scheduler';
import PlatformConnections from '../pages/PlatformConnections';

export default function AppShell() {
  return (
    <Router>
      <div className="flex h-screen bg-slate-950">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
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
