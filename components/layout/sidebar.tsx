"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  Shield,
  AlertTriangle,
  FileText,
  Crosshair,
  Settings,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/assessments", label: "Assessments", icon: Shield },
  { href: "/findings", label: "Findings", icon: AlertTriangle },
  { href: "/reports", label: "Reports", icon: FileText },
];

const secondaryNav = [
  { href: "/attacks", label: "Attack Library", icon: Crosshair },
];

const systemNav = [{ href: "/settings", label: "Settings", icon: Settings }];

export function Sidebar({ demoMode }: { demoMode: boolean }) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 border-b border-sidebar-border px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded border border-border bg-card">
          <ShieldAlert className="h-4 w-4 text-critical" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-wide">AgentBreak</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            AI Security
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <NavSection title="Workspace" items={mainNav} isActive={isActive} />
        <div className="my-3 border-t border-sidebar-border" />
        <NavSection title="Library" items={secondaryNav} isActive={isActive} />
        <div className="my-3 border-t border-sidebar-border" />
        <NavSection title="System" items={systemNav} isActive={isActive} />
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3">
        <div
          className={cn(
            "rounded border px-2.5 py-1.5 text-[11px] font-medium",
            demoMode
              ? "border-medium/40 bg-medium/10 text-medium"
              : "border-success/40 bg-success/10 text-success"
          )}
        >
          {demoMode ? "Demo Mode" : "Live AI Tests"}
        </div>
      </div>
    </aside>
  );
}

function NavSection({
  title,
  items,
  isActive,
}: {
  title: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
  isActive: (href: string) => boolean;
}) {
  return (
    <div>
      <div className="mb-1 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded px-2.5 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
