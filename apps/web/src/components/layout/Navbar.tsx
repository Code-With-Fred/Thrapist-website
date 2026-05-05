'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  LayoutDashboard,
  Heart,
  Brain,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: 'Find a Therapist', href: '/therapists' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'About', href: '/about' },
  { label: 'FAQs', href: '/faqs' },
];

function getUserMenuItems(role?: string) {
  const dashHref = role === 'therapist' ? '/therapist' : role === 'admin' ? '/admin' : '/client';
  const settingsHref = role === 'admin' ? '/admin' : `/${role ?? 'client'}/settings`;
  return [
    { label: 'Dashboard', href: dashHref, icon: LayoutDashboard },
    { label: 'Settings', href: settingsHref, icon: Settings },
  ];
}

export default function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const userMenuItems = getUserMenuItems(user?.role);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const isDatingPage = pathname?.startsWith('/dating') ?? false;
  const accentColor = isDatingPage ? 'secondary' : 'primary';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href) ?? false;
  };

  const activeLinkClass = isDatingPage
    ? 'text-secondary border-b-2 border-secondary'
    : 'text-primary border-b-2 border-primary';

  const glassClass = scrolled
    ? 'bg-white/80 backdrop-blur-xl shadow-md border-b border-border'
    : 'bg-transparent';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${glassClass}`}
    >
      {/* Section indicator strip */}
      <div
        className={`h-0.5 w-full transition-all duration-500 ${
          isDatingPage
            ? 'bg-gradient-to-r from-secondary-400 to-secondary-600'
            : 'bg-gradient-to-r from-primary-400 to-primary-600'
        }`}
      />

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${
                isDatingPage
                  ? 'bg-gradient-to-br from-secondary-400 to-secondary-600'
                  : 'bg-gradient-to-br from-primary-400 to-primary-600'
              }`}
            >
              {isDatingPage ? (
                <Heart className="w-4 h-4 text-white" />
              ) : (
                <Brain className="w-4 h-4 text-white" />
              )}
            </div>
            <span className="text-xl font-bold text-text-primary tracking-tight">
              Heal<span className={isDatingPage ? 'text-secondary' : 'text-primary'}>Mate</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActiveLink(link.href)
                      ? activeLinkClass
                      : 'text-text-secondary hover:text-text-primary hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                {/* Notification bell */}
                <div ref={notifRef} className="relative hidden md:block">
                  <button
                    onClick={() => setNotifOpen((prev) => !prev)}
                    className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-slate-100 transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary rounded-full ring-2 ring-white" />
                  </button>

                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-border overflow-hidden"
                      >
                        <div className="p-4 border-b border-border">
                          <h3 className="font-semibold text-text-primary">Notifications</h3>
                        </div>
                        <div className="p-6 text-center text-text-secondary text-sm">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p>No new notifications</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User menu */}
                <div ref={userMenuRef} className="relative hidden md:block">
                  <button
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                        isDatingPage
                          ? 'bg-gradient-to-br from-secondary-400 to-secondary-600'
                          : 'bg-gradient-to-br from-primary-400 to-primary-600'
                      }`}
                    >
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${
                        userMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-border overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-xs text-text-secondary">Signed in as</p>
                          <p className="text-sm font-medium text-text-primary truncate">
                            {user.email}
                          </p>
                        </div>
                        <div className="py-1">
                          {userMenuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setUserMenuOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-slate-50 transition-colors"
                              >
                                <Icon className="w-4 h-4" />
                                {item.label}
                              </Link>
                            );
                          })}
                        </div>
                        <div className="border-t border-border py-1">
                          <button
                            onClick={() => {
                              logout();
                              setUserMenuOpen(false);
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-slate-100"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:shadow-md active:scale-95 ${
                    isDatingPage
                      ? 'bg-secondary hover:bg-secondary-600'
                      : 'bg-primary hover:bg-primary-600'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-slate-100 transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-border"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActiveLink(link.href)
                        ? isDatingPage
                          ? 'bg-secondary-50 text-secondary'
                          : 'bg-primary-50 text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-slate-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <div className="pt-3 border-t border-border mt-3">
                {isAuthenticated && user ? (
                  <div className="space-y-1">
                    <div className="px-4 py-2">
                      <p className="text-xs text-text-secondary">Signed in as</p>
                      <p className="text-sm font-medium text-text-primary truncate">{user.email}</p>
                    </div>
                    {userMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-slate-100 transition-colors"
                        >
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                    <button
                      onClick={logout}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 px-1">
                    <Link
                      href="/login"
                      className="w-full text-center px-4 py-3 rounded-xl text-sm font-medium text-text-secondary border border-border hover:bg-slate-50 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className={`w-full text-center px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 ${
                        isDatingPage ? 'bg-secondary' : 'bg-primary'
                      }`}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>

              {/* Mode indicator badge */}
              <div className="px-1 pt-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    isDatingPage
                      ? 'bg-secondary-50 text-secondary'
                      : 'bg-primary-50 text-primary'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isDatingPage ? 'bg-secondary' : 'bg-primary'
                    }`}
                  />
                  {isDatingPage ? 'Dating Mode' : 'Therapy Mode'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
