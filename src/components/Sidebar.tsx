import { Link, useLocation } from 'react-router-dom';
import { FaCalendarAlt, FaPlug, FaSignOutAlt, FaThLarge } from 'react-icons/fa';
import { useAuth } from '../lib/auth';

const links = [
  { to: '/', label: 'Dashboard', icon: <FaThLarge /> },
  { to: '/scheduler', label: 'Scheduler', icon: <FaCalendarAlt /> },
  { to: '/connections', label: 'Connections', icon: <FaPlug /> },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950 text-white">
      <div className="border-b border-slate-800 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold">R</div>
          <div>
            <p className="text-lg font-bold">RiSoCa</p>
            <p className="text-xs text-slate-400">Scheduler</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {links.map((link) => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition ${
                active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="mb-3 rounded-xl bg-slate-900 p-3">
          <p className="truncate text-sm font-medium text-slate-200">{user?.email}</p>
          <p className="text-xs text-slate-500">Signed in with Google</p>
        </div>

        <button
          onClick={() => void signOut()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
        >
          <FaSignOutAlt />
          Sign out
        </button>
      </div>
    </aside>
  );
}
