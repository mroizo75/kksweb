"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Users,
  Building2,
  Briefcase,
  UserPlus,
  FileText,
  CheckSquare,
  RefreshCw,
  Award,
  ClipboardCheck,
  FileImage,
  Shield,
  LogOut,
  AlertTriangle,
  FileCheck,
  Search,
  TrendingUp,
  Target,
  UserCheck,
  Key,
  ShieldAlert,
  FileKey,
  History,
  Settings,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Kurs",
    href: "/admin/kurs",
    icon: BookOpen,
  },
  {
    name: "Sesjoner",
    href: "/admin/sesjoner",
    icon: Calendar,
  },
  {
    name: "Påmeldinger",
    href: "/admin/pameldinger",
    icon: UserCheck,
  },
  {
    name: "Bulk-påmelding",
    href: "/admin/bulk-pamelding",
    icon: Users,
  },
  {
    name: "Kunder",
    href: "/admin/kunder",
    icon: Building2,
  },
  {
    name: "Lisenser",
    href: "/admin/lisenser",
    icon: Key,
  },
  {
    name: "CRM",
    icon: Briefcase,
    children: [
      { name: "Leads", href: "/admin/crm/leads", icon: UserPlus },
      { name: "Avtaler", href: "/admin/crm/deals", icon: FileText },
      { name: "Aktiviteter", href: "/admin/crm/activities", icon: CheckSquare },
      { name: "Fornyelser", href: "/admin/crm/renewals", icon: RefreshCw },
    ],
  },
  {
    name: "Kompetanse",
    href: "/admin/kompetanse",
    icon: Award,
  },
  {
    name: "Vurdering",
    href: "/admin/vurdering",
    icon: ClipboardCheck,
  },
  {
    name: "Maler",
    href: "/admin/maler",
    icon: FileImage,
  },
  {
    name: "Gyldighet",
    href: "/admin/gyldighet",
    icon: Shield,
  },
  {
    name: "Kvalitet (ISO 9001)",
    icon: CheckSquare,
    children: [
      { name: "Avvik", href: "/admin/kvalitet/avvik", icon: AlertTriangle },
      { name: "Dokumenter", href: "/admin/kvalitet/dokumenter", icon: FileCheck },
      { name: "Revisjoner", href: "/admin/kvalitet/revisjoner", icon: Search },
      { name: "Risiko", href: "/admin/kvalitet/risiko", icon: TrendingUp },
      { name: "KPI & Mål", href: "/admin/kvalitet/kpi", icon: Target },
    ],
  },
  {
    name: "Sikkerhet (ISO 27001)",
    icon: ShieldAlert,
    children: [
      { name: "Hendelser", href: "/admin/sikkerhet/hendelser", icon: AlertTriangle },
      { name: "Politikk", href: "/admin/sikkerhet/politikk", icon: FileKey },
      { name: "Audit Log", href: "/admin/sikkerhet/audit", icon: History },
      { name: "GDPR", href: "/admin/sikkerhet/gdpr", icon: UserX },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/40">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin/dashboard" className="text-xl font-bold">
          KKS Admin
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          if (item.children) {
            // Parent item with children
            const isAnyChildActive = item.children.some(
              (child) => pathname === child.href
            );
            return (
              <div key={item.name} className="space-y-1">
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                    isAnyChildActive
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </div>
                <div className="ml-6 space-y-1">
                  {item.children.map((child) => {
                    const isActive = pathname === child.href;
                    return (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <child.icon className="h-4 w-4" />
                        {child.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          // Regular item without children
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href!}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Settings & Logout */}
      <div className="border-t p-3 space-y-1">
        <Link href="/admin/settings">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              pathname?.startsWith("/admin/settings") && "bg-muted"
            )}
          >
            <Settings className="mr-3 h-4 w-4" />
            Innstillinger
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logg ut
        </Button>
      </div>
    </div>
  );
}

