import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <Sidebar />
      <main className="lg:ml-64 min-h-screen transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
}
