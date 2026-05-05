'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Wallet,
  MessageSquare,
  Heart,
  Settings,
  Clock,
  Users,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  Menu,
  X,
  LogOut,
  Bell,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const clientNav: NavItem[] = [
  { label: 'Dashboard', href: '/client', icon: <LayoutDashboard size={18} /> },
  { label: 'Sessions', href: '/client/sessions', icon: <CalendarDays size={18} /> },
  { label: 'Wallet', href: '/client/wallet', icon: <Wallet size={18} /> },
  { label: 'Messages', href: '/client/messages', icon: <MessageSquare size={18} /> },
  { label: 'Connect', href: '/connect', icon: <Heart size={18} /> },
  { label: 'Settings', href: '/client/settings', icon: <Settings size={18} /> },
];

const therapistNav: NavItem[] = [
  { label: 'Dashboard', href: '/therapist', icon: <LayoutDashboard size={18} /> },
  { label: 'Availability', href: '/therapist/availability', icon: <Clock size={18} /> },
  { label: 'Clients', href: '/therapist/clients', icon: <Users size={18} /> },
  { label: 'Earnings', href: '/therapist/earnings', icon: <DollarSign size={18} /> },
  { label: 'Messages', href: '/therapist/messages', icon: <MessageSquare size={18} /> },
  { label: 'Settings', href: '/therapist/settings', icon: <Settings size={18} /> },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={18} /> },
  { label: 'Therapists', href: '/admin/therapists', icon: <ShieldCheck size={18} /> },
  { label: 'Users', href: '/admin/users', icon: <Users size={18} /> },
  { label: 'Moderation', href: '/admin/moderation', icon: <ShieldCheck size={18} /> },
  { label: 'Revenue', href: '/admin/revenue', icon: <TrendingUp size={18} /> },
];

function getNavItems(role: 'client' | 'therapist' | 'admin' | undefined): NavItem[] {
  if (role === 'therapist') return therapistNav;
  if (role === 'admin') return adminNav;
  return clientNav;
}

function getInitials(email: string): string {
  return email.slice(0, 2).toUpperCase();
}

function getRoleColor(role: string | undefined): string {
  if (role === 'therapist') return '#FF6B9D';
  if (role === 'admin') return '#F59E0B';
  return '#4F7EFF';
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace('/login');
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center animate-pulse"
            style={{ background: 'linear-gradient(135deg, #4F7EFF 0%, #FF6B9D 100%)' }}
          >
            <Heart size={22} color="white" />
          </div>
          <p className="text-sm text-[#64748B]">Loading HealMate…</p>
        </div>
      </div>
    );
  }

  const navItems = getNavItems(user.role);
  const roleColor = getRoleColor(user.role);

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    router.push('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-[#E2E8F0]">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #4F7EFF 0%, #FF6B9D 100%)' }}
        >
          <Heart size={16} color="white" />
        </div>
        <span
          className="text-lg font-bold"
          style={{
            background: 'linear-gradient(135deg, #4F7EFF 0%, #FF6B9D 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          HealMate
        </span>
      </div>

      {/* Role badge */}
      <div className="px-6 py-3">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
          style={{ background: `${roleColor}15`, color: roleColor }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: roleColor }} />
          {user.role}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/client' && item.href !== '/therapist' && item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
              style={{
                background: isActive ? `${roleColor}12` : 'transparent',
                color: isActive ? roleColor : '#64748B',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.background = '#F1F5F9';
                  (e.currentTarget as HTMLAnchorElement).style.color = '#0F172A';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  (e.currentTarget as HTMLAnchorElement).style.color = '#64748B';
                }
              }}
            >
              <span style={{ color: isActive ? roleColor : 'inherit' }}>{item.icon}</span>
              {item.label}
              {isActive && (
                <div
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: roleColor }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User / logout at bottom */}
      <div className="px-3 py-4 border-t border-[#E2E8F0]">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#64748B] hover:bg-red-50 hover:text-red-500 transition-all duration-150"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white border-r border-[#E2E8F0] fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Sidebar — mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-72 bg-white border-r border-[#E2E8F0] z-50 shadow-2xl">
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
            >
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col lg:pl-60 min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Page title / breadcrumb placeholder */}
          <div className="hidden sm:block flex-1">
            <p className="text-sm text-[#64748B] capitalize">
              {navItems.find((n) => pathname === n.href || pathname.startsWith(n.href))?.label ?? 'Dashboard'}
            </p>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button
              type="button"
              aria-label="Notifications"
              className="relative w-9 h-9 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
            >
              <Bell size={18} />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
                style={{ background: '#FF6B9D' }}
              />
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-[#F1F5F9] transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: `linear-gradient(135deg, ${roleColor} 0%, ${roleColor}99 100%)` }}
                >
                  {getInitials(user.email)}
                </div>
                <span className="hidden sm:block text-sm font-medium text-[#0F172A] max-w-[120px] truncate">
                  {user.email.split('@')[0]}
                </span>
                <ChevronDown size={14} className="text-[#64748B]" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-[#E2E8F0] shadow-lg shadow-slate-200/60 py-1.5 z-20">
                    <div className="px-3 py-2 border-b border-[#E2E8F0] mb-1">
                      <p className="text-xs font-medium text-[#0F172A] truncate">{user.email}</p>
                      <p className="text-xs text-[#64748B] capitalize">{user.role}</p>
                    </div>
                    <Link
                      href={`/${user.role}/settings`}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
                    >
                      <Settings size={15} /> Settings
                    </Link>
                    <button
                      type="button"
                      onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
