import { Link, useLocation } from 'react-router-dom';
import { FaCalendarAlt, FaPlug, FaSignOutAlt, FaThLarge } from 'react-icons/fa';
import { useAuth } from '../lib/useAuth';
import { Button } from './ui';
import { cx } from '../lib/styles';

const links = [
  { to: '/', label: 'Dashboard', icon: <FaThLarge /> },
  { to: '/scheduler', label: 'Scheduler', icon: <FaCalendarAlt /> },
  { to: '/connections', label: 'Connections', icon: <FaPlug /> },
];

export default function Sidebar() {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <>
      <aside className="hidden h-screen w-56 shrink-0 flex-col border-r border-white/10 bg-slate-950/80 text-white backdrop-blur-xl lg:flex">
        <BrandBlock />

        <nav className="flex-1 space-y-1.5 p-3">
          {links.map((link) => {
            const active = location.pathname === link.to;
            return <NavLink key={link.to} {...link} active={active} />;
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
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
    <div className="border-b border-white/10 p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-black shadow-glow">R</div>
          <div>
            <p className="text-base font-black tracking-tight">RiSoCa</p>
            <p className="text-[11px] font-medium text-slate-400">Private scheduler</p>
          </div>
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
        'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold transition',
        active
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/30'
          : 'text-slate-300 hover:bg-slate-900 hover:text-white'
      )}
    >
      <span className="text-sm">{icon}</span>
      {label}
    </Link>
  );
}
