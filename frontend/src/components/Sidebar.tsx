import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Pill,
  Activity,
  Menu,
  X,
  LogOut,
  Settings,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-surface-900 rounded-xl shadow-card border border-surface-200 dark:border-surface-800 text-surface-900 dark:text-white"
        id="sidebar-toggle"
      >
        {collapsed ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 bg-white dark:bg-surface-950 border-r border-surface-200 dark:border-surface-800
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-64'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-surface-100 dark:border-surface-800">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm">
            <Activity size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-surface-900 dark:text-white tracking-tight">MedRecord</h1>
            <p className="text-[10px] font-semibold text-primary-600 uppercase tracking-widest -mt-0.5">Pro</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1">
          <p className="px-3 text-[10px] font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-widest mb-3">
            Main Menu
          </p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setCollapsed(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800/50 hover:text-surface-900 dark:hover:text-white'
                }`
              }
              id={`nav-${label.toLowerCase()}`}
            >
              <Icon
                size={18}
                className="transition-colors duration-200 group-hover:text-primary-600"
              />
              <span>{label}</span>
            </NavLink>
          ))}

          <div className="pt-4 mt-4 border-t border-surface-100 dark:border-surface-800">
            <p className="px-3 text-[10px] font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-widest mb-3">
              Quick Links
            </p>
            <NavLink
              to="/patients"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800/50 hover:text-surface-900 dark:hover:text-white transition-all"
            >
              <FileText size={18} />
              <span>Records</span>
            </NavLink>
            <NavLink
              to="/patients"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800/50 hover:text-surface-900 dark:hover:text-white transition-all"
            >
              <Pill size={18} />
              <span>Prescriptions</span>
            </NavLink>
          </div>
        </nav>

        {/* Bottom card / Logout */}
        <div className="absolute bottom-4 left-3 right-3">
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-4 text-white flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold opacity-90">{user?.username || 'User'}</p>
              <p className="text-[10px] opacity-70 mt-1">EMR System</p>
            </div>
            <button onClick={logout} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {collapsed && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setCollapsed(false)}
        />
      )}
    </>
  );
}
