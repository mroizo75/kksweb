"use client";

import Link from "next/link";
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
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "INSTRUCTOR"],
  },
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
    roles: ["ADMIN", "INSTRUCTOR"], // INSTRUCTOR kan nå melde på flere deltakere
  },
  {
    name: "Kunder",
    href: "/admin/kunder",
    icon: Building2,
    roles: ["ADMIN", "INSTRUCTOR"], // INSTRUCTOR kan se kunder
  },
  {
    name: "Lisenser",
    href: "/admin/lisenser",
    icon: Key,
    roles: ["ADMIN"], // Kun ADMIN
  },
  {
    name: "CRM",
    icon: Briefcase,
    roles: ["ADMIN", "INSTRUCTOR"], // INSTRUCTOR selger inn kurs selv
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
    roles: ["ADMIN", "INSTRUCTOR"], // INSTRUCTOR kan bruke maler
  },
  {
    name: "Gyldighet",
    href: "/admin/gyldighet",
    icon: Shield,
    roles: ["ADMIN", "INSTRUCTOR"], // INSTRUCTOR kan se gyldighetsregler
  },
  {
    name: "Kvalitet (ISO 9001)",
    icon: CheckSquare,
    roles: ["ADMIN", "INSTRUCTOR"], // INSTRUCTOR kan se kvalitetssystem
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
    roles: ["ADMIN"], // Kun ADMIN - INSTRUCTOR har IKKE tilgang
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
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "USER";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filtrer navigation basert på brukerens rolle
  const filteredNavigation = navigation.filter((item) => 
    item.roles?.includes(userRole as "ADMIN" | "INSTRUCTOR")
  );

  // Lukk mobil-meny ved navigasjon
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed md:static inset-y-0 left-0 z-40 flex h-full w-64 flex-col border-r bg-background transition-transform duration-200 ease-in-out md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/admin/dashboard" className="text-xl font-bold" onClick={handleLinkClick}>
            KKS Admin
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {filteredNavigation.map((item) => {
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
                        onClick={handleLinkClick}
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
              onClick={handleLinkClick}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

        {/* Settings & Logout */}
        <div className="border-t p-3 space-y-1">
          <Link href="/admin/settings" onClick={handleLinkClick}>
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
    </>
  );
}

