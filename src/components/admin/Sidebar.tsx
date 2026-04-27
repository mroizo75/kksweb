"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Users,
  Building2,
  Briefcase,
  UserPlus,
  CheckSquare,
  RefreshCw,
  Award,
  ClipboardCheck,
  FileImage,
  Shield,
  LogOut,
  Target,
  UserCheck,
  Key,
  Settings,
  Menu,
  X,
  Sparkles,
  BarChart3,
  Contact,
  PieChart,
  PenSquare,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface NavChild {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface NavItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  children?: NavChild[];
}

const navGroups: NavGroup[] = [
  {
    label: "Oversikt",
    items: [
      {
        name: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
        roles: ["ADMIN", "INSTRUCTOR"],
      },
    ],
  },
  {
    label: "Kurs",
    items: [
      {
        name: "Kurs",
        href: "/admin/kurs",
        icon: BookOpen,
        roles: ["ADMIN", "INSTRUCTOR"],
      },
      {
        name: "Sesjoner",
        href: "/admin/sesjoner",
        icon: Calendar,
        roles: ["ADMIN", "INSTRUCTOR"],
      },
      {
        name: "Påmeldinger",
        href: "/admin/pameldinger",
        icon: UserCheck,
        roles: ["ADMIN", "INSTRUCTOR"],
      },
      {
        name: "Bulk-påmelding",
        href: "/admin/bulk-pamelding",
        icon: Users,
        roles: ["ADMIN", "INSTRUCTOR"],
      },
      {
        name: "Kunder",
        href: "/admin/kunder",
        icon: Building2,
        roles: ["ADMIN", "INSTRUCTOR"],
      },
      {
        name: "Kompetanse",
        href: "/admin/kompetanse",
        icon: Award,
        roles: ["ADMIN", "INSTRUCTOR"],
      },
      {
        name: "Vurdering",
        href: "/admin/vurdering",
        icon: ClipboardCheck,
        roles: ["ADMIN", "INSTRUCTOR"],
      },
      {
        name: "Maler",
        href: "/admin/maler",
        icon: FileImage,
        roles: ["ADMIN", "INSTRUCTOR"],
      },
      {
        name: "Gyldighet",
        href: "/admin/gyldighet",
        icon: Shield,
        roles: ["ADMIN", "INSTRUCTOR"],
      },
    ],
  },
  {
    label: "CRM",
    items: [
      {
        name: "CRM",
        icon: Briefcase,
        roles: ["ADMIN", "INSTRUCTOR"],
        children: [
          { name: "Dashboard", href: "/admin/crm/dashboard", icon: PieChart },
          { name: "Leads", href: "/admin/crm/leads", icon: UserPlus },
          { name: "Pipeline", href: "/admin/crm/deals", icon: BarChart3 },
          { name: "Bedrifter", href: "/admin/crm/bedrifter", icon: Building2 },
          { name: "Kontakter", href: "/admin/crm/kontakter", icon: Contact },
          { name: "Aktiviteter", href: "/admin/crm/activities", icon: CheckSquare },
          { name: "Fornyelser", href: "/admin/crm/renewals", icon: RefreshCw },
        ],
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        name: "Blogg",
        href: "/admin/blogg",
        icon: PenSquare,
        roles: ["ADMIN"],
      },
      {
        name: "Lisenser",
        href: "/admin/lisenser",
        icon: Key,
        roles: ["ADMIN"],
      },
      {
        name: "Produktlisenser",
        href: "/admin/produktlisenser",
        icon: Key,
        roles: ["ADMIN"],
      },
      {
        name: "Facebook Ads",
        icon: Sparkles,
        roles: ["ADMIN"],
        children: [
          { name: "Kampanjer", href: "/admin/facebook-ads", icon: Target },
          { name: "Analytics", href: "/admin/facebook-ads/analytics", icon: BarChart3 },
        ],
      },
    ],
  },
];

function NavLink({
  href,
  icon: Icon,
  name,
  isActive,
  onClick,
  indent = false,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  isActive: boolean;
  onClick: () => void;
  indent?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all",
        indent && "ml-5",
        isActive
          ? "bg-amber-500 text-slate-950 font-semibold"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      )}
    >
      <Icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-slate-950" : "text-slate-500")} />
      {name}
    </Link>
  );
}

function ExpandableNav({
  item,
  pathname,
  onClick,
}: {
  item: NavItem;
  pathname: string;
  onClick: () => void;
}) {
  const isAnyChildActive = item.children?.some((child) =>
    pathname.startsWith(child.href)
  ) ?? false;
  const [open, setOpen] = useState(isAnyChildActive);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between gap-2.5 rounded-lg px-3 py-2 text-sm transition-all",
          isAnyChildActive
            ? "text-amber-400 font-medium"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        )}
      >
        <div className="flex items-center gap-2.5">
          <item.icon className={cn("h-4 w-4 flex-shrink-0", isAnyChildActive ? "text-amber-400" : "text-slate-500")} />
          {item.name}
        </div>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
        )}
      </button>
      {open && item.children && (
        <div className="mt-1 space-y-0.5">
          {item.children.map((child) => (
            <NavLink
              key={child.href}
              href={child.href}
              icon={child.icon}
              name={child.name}
              isActive={pathname === child.href || pathname.startsWith(child.href + "/")}
              onClick={onClick}
              indent
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role || "USER";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLinkClick = () => setIsMobileMenuOpen(false);

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-slate-950 border-r border-slate-800">
      {/* Logo */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-slate-800">
        <Link
          href="/admin/dashboard"
          onClick={handleLinkClick}
          className="flex items-center gap-2"
        >
          <Image
            src="/logo-white-kks.png"
            alt="KKS AS"
            width={100}
            height={33}
            className="h-7 w-auto"
          />
          <span className="text-xs text-slate-500 font-medium border-l border-slate-700 pl-2">
            Admin
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden text-slate-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) =>
            item.roles.some((r) => r === userRole)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label}>
              <p className="px-3 mb-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  if (item.children) {
                    return (
                      <ExpandableNav
                        key={item.name}
                        item={item}
                        pathname={pathname}
                        onClick={handleLinkClick}
                      />
                    );
                  }
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin/dashboard" && pathname.startsWith(item.href!));
                  return (
                    <NavLink
                      key={item.name}
                      href={item.href!}
                      icon={item.icon}
                      name={item.name}
                      isActive={isActive}
                      onClick={handleLinkClick}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom — settings & logout */}
      <div className="border-t border-slate-800 p-3 space-y-0.5">
        <Link
          href="/admin/settings"
          onClick={handleLinkClick}
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all",
            pathname.startsWith("/admin/settings")
              ? "bg-amber-500 text-slate-950 font-semibold"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          )}
        >
          <Settings className="h-4 w-4 flex-shrink-0" />
          Innstillinger
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Logg ut
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        className="fixed top-4 left-4 z-50 md:hidden bg-slate-900 text-slate-300 hover:text-white p-2 rounded-lg border border-slate-700"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Åpne meny"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-56 md:flex-col md:h-screen md:flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col md:hidden transition-transform duration-200 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </div>
    </>
  );
}
