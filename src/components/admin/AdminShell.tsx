import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/hooks/useAuthUser";

export interface AdminNavItem {
  label: string;
  href: string;
  description?: string;
}

interface AdminShellProps {
  children: ReactNode;
  navItems: AdminNavItem[];
}

const getInitials = (value?: string) => {
  if (!value) return "WG";
  return value
    .split(" ")
    .map((piece) => piece[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const AdminShell = ({ children, navItems }: AdminShellProps) => {
  const { user, logout } = useAuthUser();
  const displayName = user?.username || user?.name || "User";
  const displayEmail = user?.email || "—";
  const avatarLabel = user?.username || user?.name || user?.email;

  return (
    <div className="flex min-h-screen bg-muted/30 text-foreground">
      <aside className="hidden w-72 flex-col border-r border-border/70 bg-background/95 px-6 py-10 lg:flex">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">WequiGuard</p>
          <p className="text-2xl font-semibold tracking-tight">Admin Console</p>
          <p className="text-sm text-muted-foreground">Realtime network insights</p>
        </div>

        <nav className="mt-10 flex-1 space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={cn(
                "group flex w-full items-start justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-muted-foreground transition",
                "hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <a href={item.href}>
                <div className="space-y-1">
                  <p className="font-semibold tracking-tight">{item.label}</p>
                  {item.description ? <p className="text-xs text-muted-foreground">{item.description}</p> : null}
                </div>
                <span className="text-xs text-muted-foreground transition group-hover:translate-x-1">&gt;</span>
              </a>
            </Button>
          ))}
        </nav>
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4 text-xs leading-relaxed text-muted-foreground">
          Auto-refresh: Dashboard 10s · Live Feed 2s · Health 30s
        </div>
      </aside>

      <div className="flex-1">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 px-8 py-5 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Network Operations</p>
              <h1 className="text-3xl font-semibold tracking-tight">Admin Dashboard</h1>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {user ? (
                <>
                  <div className="text-right text-sm">
                    <p className="font-semibold text-foreground capitalize">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{displayEmail}</p>
                  </div>
                  <Link
                    to="/profile"
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold uppercase text-primary"
                  >
                    {getInitials(avatarLabel)}
                  </Link>
                  <Button variant="outline" size="sm" className="rounded-full px-4" onClick={logout}>
                    Logout
                  </Button>
                </>
              ) : (
                <Button asChild size="sm" className="rounded-full px-4">
                  <Link to="/login">Login</Link>
                </Button>
              )}
            </div>
          </div>
        </header>
        <ScrollArea className="h-[calc(100vh-4.5rem)]">
          <main className="mx-auto max-w-7xl space-y-16 px-6 py-10">{children}</main>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AdminShell;
