"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Profile, Branch } from "@/types";
import { signOut } from "@/app/admin/actions";
import { Toast } from "@/components/admin/toast";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  Clock,
  Banknote,
  FileBarChart,
  Menu,
  X,
  LogOut,
  Loader2,
  MapPin,
  ExternalLink,
  LayoutTemplate,
  Layers,
  Building2,
} from "lucide-react";

interface AdminShellProps {
  profile: Profile;
  branches?: Branch[];
  children: React.ReactNode;
}

export function AdminShell({ profile, branches = [], children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, startLogoutTransition] = useTransition();


  interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: ("admin" | "guru")[];
    exact?: boolean;
  }

  interface NavGroup {
    title: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      title: "Menu Utama",
      items: [
        {
          label: "Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
          roles: ["admin", "guru"],
          exact: true,
        },
      ],
    },
    {
      title: "Data Master",
      items: [
        {
          label: "Data Cabang",
          href: "/admin/cabang",
          icon: Building2,
          roles: ["admin"],
        },
        {
          label: "Program Belajar",
          href: "/admin/program",
          icon: Layers,
          roles: ["admin"],
        },
        {
          label: "Data Guru",
          href: "/admin/guru",
          icon: Users,
          roles: ["admin"],
        },
        {
          label: "Data Murid",
          href: "/admin/murid",
          icon: GraduationCap,
          roles: ["admin", "guru"],
        },
      ],
    },
    {
      title: "Konten & Website",
      items: [
        {
          label: "Landing Page",
          href: "/admin/landing",
          icon: LayoutTemplate,
          roles: ["admin"],
        },
      ],
    },
  ];

  const upcomingItems = [
    { label: "Jadwal Belajar", icon: Calendar },
    { label: "Kehadiran", icon: Clock },
    { label: "Penggajian", icon: Banknote },
    { label: "Laporan", icon: FileBarChart },
  ];

  const allowedGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(profile.role)),
    }))
    .filter((group) => group.items.length > 0);

  function handleLogout() {
    startLogoutTransition(async () => {
      await signOut();
    });
  }

  const branchMap: Record<string, string> = Object.fromEntries(
    branches.map((b) => [b.id, b.name])
  );
  const branchDisplay = profile.branch_id
    ? branchMap[profile.branch_id] ?? profile.branch_id
    : "Semua Cabang";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar: Desktop fixed/sticky + Mobile drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-slate-200/80 shrink-0 shadow-2xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-uzma-course.jpg"
                alt="Logo Uzma Course"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="font-heading font-bold text-base text-slate-900 leading-none block">
                Uzma Course
              </span>
              <span className="text-[10px] text-primary-600 font-semibold uppercase tracking-wider block mt-0.5">
                Mini ERP
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
          {allowedGroups.map((group) => (
            <div key={group.title}>
              <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {group.title}
              </p>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 sm:py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary-50 text-primary-700 shadow-xs font-semibold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-primary-600" : "text-slate-400"
                        }`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}

          <div>
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Segera Hadir
            </p>
            <div className="space-y-1">
              {upcomingItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between px-3 py-2 text-xs text-slate-400 rounded-xl cursor-not-allowed select-none"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0 text-slate-300" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-400 font-medium">
                      Segera
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Card & Logout in Sidebar Footer */}
        <div className="p-3.5 pb-8 md:pb-3 border-t border-slate-100 bg-slate-50/50">
          <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-2xs mb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 truncate">
                {profile.full_name}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                  profile.role === "admin"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {profile.role}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{branchDisplay}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Link
              href="/"
              target="_blank"
              className="text-[11px] text-slate-500 hover:text-primary-600 font-medium inline-flex items-center gap-1"
            >
              <span>Landing Page</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-[11px] text-rose-600 hover:text-rose-700 font-medium inline-flex items-center gap-1.5 p-1 rounded-lg hover:bg-rose-50 transition-colors"
            >
              {isLoggingOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
              aria-label="Buka navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="md:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-200/80 shrink-0 shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo-uzma-course.jpg"
                  alt="Logo Uzma Course"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-heading font-bold text-sm text-slate-900 leading-none">
                Uzma Course
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-medium text-slate-500">
                Portal Mini ERP Uzma Course
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {profile.full_name}
              </p>
              <p className="text-[10px] text-slate-500">
                {branchDisplay}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-3 py-2 sm:py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200/80 rounded-xl transition-colors inline-flex items-center gap-1.5 min-h-[38px] sm:min-h-0"
              aria-label="Keluar dari akun"
            >
              {isLoggingOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              ) : (
                <LogOut className="w-3.5 h-3.5 shrink-0" />
              )}
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      <Toast />
    </div>
  );
}
