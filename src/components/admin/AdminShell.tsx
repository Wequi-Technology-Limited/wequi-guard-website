import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface AdminNavItem {
  label: string;
  href: string;
  description?: string;
}

interface AdminShellProps {
  children: ReactNode;
  navItems: AdminNavItem[];
}

const AdminShell = ({ children, navItems }: AdminShellProps) => {
  return (
    <div className="flex min-h-screen bg-muted/20 text-foreground">
      <aside className="hidden min-h-screen w-64 flex-col border-r bg-card/70 p-6 lg:flex">
        <div className="mb-8 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">WequiGuard</p>
          <p className="text-xl font-bold">Admin Console</p>
          <p className="text-xs text-muted-foreground">Prepared for API integration</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="block">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left font-medium",
                  "hover:bg-primary/10 hover:text-primary",
                )}
              >
                <div>
                  <p>{item.label}</p>
                  {item.description ? <p className="text-xs text-muted-foreground">{item.description}</p> : null}
                </div>
              </Button>
            </a>
          ))}
        </nav>
        <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
          Auto-refresh: Dashboard 10s · Live Feed 2s · Health 30s
        </div>
      </aside>

      <div className="flex-1">
        <header className="sticky top-0 z-30 border-b bg-background/80 px-6 py-4 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">WequiGuard</p>
              <h1 className="text-2xl font-bold">Network Operations</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Pause Auto-Refresh
              </Button>
              <Button size="sm">Create Report</Button>
            </div>
          </div>
        </header>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <main className="space-y-16 px-6 py-10">{children}</main>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AdminShell;
