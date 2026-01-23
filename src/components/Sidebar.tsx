import { Link, useLocation } from 'react-router-dom';
import { FaThLarge, FaCalendarAlt, FaUser, FaLayerGroup, FaPlug } from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 h-screen flex flex-col border-r border-slate-700/50 shadow-2xl">
      {/* Logo with gradient */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-700/50">
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-primary via-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/50 animate-pulse-slow">
            R
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-purple-600 rounded-xl blur opacity-50"></div>
        </div>
        <div>
          <span className="text-white text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            RiSoCa
          </span>
          <p className="text-gray-400 text-xs">Social Scheduler</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link
          to="/"
          className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            location.pathname === '/'
              ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/50 scale-105'
              : 'text-gray-300 hover:bg-slate-800/50 hover:text-white hover:scale-105'
          }`}
        >
          <FaThLarge className={`text-lg ${location.pathname === '/' ? 'animate-pulse' : ''}`} />
          <span className="font-medium">Dashboard</span>
        </Link>
        <Link
          to="/scheduler"
          className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            location.pathname === '/scheduler'
              ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/50 scale-105'
              : 'text-gray-300 hover:bg-slate-800/50 hover:text-white hover:scale-105'
          }`}
        >
          <FaCalendarAlt className={`text-lg ${location.pathname === '/scheduler' ? 'animate-pulse' : ''}`} />
          <span className="font-medium">Scheduler</span>
        </Link>
        <Link
          to="/batch-scheduler"
          className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            location.pathname === '/batch-scheduler'
              ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/50 scale-105'
              : 'text-gray-300 hover:bg-slate-800/50 hover:text-white hover:scale-105'
          }`}
        >
          <FaLayerGroup className={`text-lg ${location.pathname === '/batch-scheduler' ? 'animate-pulse' : ''}`} />
          <span className="font-medium">Batch Scheduler</span>
        </Link>
        <Link
          to="/connections"
          className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
            location.pathname === '/connections'
              ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/50 scale-105'
              : 'text-gray-300 hover:bg-slate-800/50 hover:text-white hover:scale-105'
          }`}
        >
          <FaPlug className={`text-lg ${location.pathname === '/connections' ? 'animate-pulse' : ''}`} />
          <span className="font-medium">Platform Connections</span>
        </Link>
      </nav>

      {/* User Profile with gradient border */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-full flex items-center justify-center border-2 border-primary/50">
                <FaUser className="text-gray-300" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">Demo User</p>
              <p className="text-gray-400 text-xs truncate">demo@risoca.app</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
