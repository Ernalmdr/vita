import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react';
import { signOut } from '@/app/actions/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-congress-cream flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-congress-red text-white flex flex-col shadow-xl md:min-h-screen">
        <div className="p-6 text-center md:text-left border-b border-white/10 flex flex-col items-center md:items-start">
          <div className="relative w-24 h-24 mb-3 bg-white rounded-full p-2">
            <Image 
              src="/logo.jpg" 
              alt="Vita Cordis Logo" 
              fill
              className="object-contain rounded-full"
            />
          </div>
          <h1 className="font-serif text-xl font-bold tracking-wider text-congress-gold">Vita Cordis</h1>
          <p className="text-sm opacity-80 mt-1 uppercase tracking-widest text-congress-cream">Admin Panel</p>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          <Link href="/admin" className="flex items-center space-x-3 px-4 py-3 bg-white/10 rounded-lg text-white font-medium transition-colors">
            <LayoutDashboard size={20} className="text-congress-gold" />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/registrations" className="flex items-center space-x-3 px-4 py-3 hover:bg-white/5 rounded-lg text-white/80 transition-colors">
            <Users size={20} />
            <span>Registrations</span>
          </Link>
          <Link href="/admin/settings" className="flex items-center space-x-3 px-4 py-3 hover:bg-white/5 rounded-lg text-white/80 transition-colors">
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>
        
        {/* Log Out Form utilizing Server Action */}
        <div className="p-4 border-t border-white/10 mt-auto">
          <form action={signOut}>
            <button type="submit" className="flex items-center justify-start space-x-3 px-4 py-3 w-full hover:bg-white/5 rounded-lg text-white/80 transition-colors">
              <LogOut size={20} />
              <span>Log Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
