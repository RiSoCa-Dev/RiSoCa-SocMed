import { Link, useLocation } from 'react-router-dom';
import { FaCalendarAlt, FaLock, FaPlug, FaSignOutAlt, FaThLarge } from 'react-icons/fa';
import { useAuth } from '../lib/useAuth';
import { Badge, Button } from './ui';
import { cx } from '../lib/styles';

const links = [
  { to: '/', label: 'Dashboard', icon: <FaThLarge /> },
  { to: '/scheduler', label: 'Scheduler', icon: <FaCalendarAlt /> },
  { to: '/connections', label: 'Connections', icon: <FaPlug /> },
];

export default function Sidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <>
      <aside className="hidden h-screen w-72 shrink-0 flex-col border-r border-white/10 bg-slate-950/80 text-white backdrop-blur-xl lg:flex">
        <BrandBlock />

        <nav className="flex-1 space-y-2 p-4">
          {links.map((link) => {
            const active = location.pathname === link.to;
            return <NavLink key={link.to} {...link} active={active} />;
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
            <div className="mb-2 flex items-center gap-2">
              <Badge tone="success">
                <FaLock />
                Owner only
              </Badge>
            </div>
            <p className="truncate text-sm font-semibold text-slate-100">{user?.email}</p>
            <p className="text-xs text-slate-500">Private Google session</p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => void signOut()}
            className="w-full"
          >
            <FaSignOutAlt />
            Sign out
          </Button>
        </div>
      </aside>

      <nav className="fixed inset-x-3 bottom-3 z-50 rounded-3xl border border-white/10 bg-slate-950/90 p-2 shadow-2xl shadow-slate-950/60 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-3 gap-2">
          {links.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cx(
                  'flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 text-xs font-bold transition',
                  active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                )}
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function BrandBlock() {
  return (
    <div className="border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-lg font-black shadow-glow">R</div>
          <div>
            <p className="text-lg font-black tracking-tight">RiSoCa</p>
            <p className="text-xs font-medium text-slate-400">Private scheduler</p>
          </div>
        </div>
      <div className="mt-5 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">Workspace</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">Plan, preview, and publish from one private control room.</p>
      </div>
    </div>
  );
}

function NavLink({
  to,
  label,
  icon,
  active,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={cx(
        'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition',
        active
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/30'
          : 'text-slate-300 hover:bg-slate-900 hover:text-white'
      )}
    >
      <span className="text-base">{icon}</span>
      {label}
    </Link>
  );
}
