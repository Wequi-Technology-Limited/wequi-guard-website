import { formatDistanceToNowStrict } from "date-fns";
import { useMemo, useState, type ComponentProps, type ReactNode } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Download,
  MoreHorizontal,
  PenLine,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldOff,
  Trash2,
} from "lucide-react";

import AdminShell from "@/components/admin/AdminShell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  useCreateOverride,
  useDeleteOverride,
  useExportQueryFeed,
  useMonitorAlerts,
  useMonitorApps,
  useMonitorCacheMetrics,
  useMonitorOverview,
  useMonitorPolicies,
  useMonitorQueryFeed,
  useMonitorOverrides,
  useMonitorTlsStatus,
  useMonitorUpstreams,
  useMonitorUsers,
  useMonitorDevices,
  useUpdatePolicy,
} from "@/hooks/useAdminMonitor";
import { cn } from "@/lib/utils";
import type {
  CreateOverridePayload,
  MonitorAlert,
  MonitorApp,
  MonitorCacheHotDomain,
  MonitorKpi,
  MonitorPolicy,
  MonitorUser,
  MonitorUserDevice,
  MonitorWindow,
  QueryFeedFilters,
  QueryFeedRow,
} from "@/types/admin";
import type { LucideIcon } from "lucide-react";
import { Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts";

export const ADMIN_NAV = [
  { label: "Profile", href: "/profile", description: "Account" },
  { label: "Dashboard (Overview)", href: "#dashboard", description: "Traffic & health" },
  { label: "Apps", href: "#apps", description: "Integrations" },
  { label: "Alerts", href: "#alerts", description: "Notifications" },
  { label: "Live Feed", href: "#live-feed", description: "Realtime triage" },
  { label: "Users", href: "#users", description: "Accounts" },
  { label: "Devices", href: "#devices", description: "Endpoints" },
  { label: "Policies", href: "#policies", description: "Rules" },
  { label: "Overrides", href: "#overrides", description: "Exceptions" },
  { label: "Health", href: "#health", description: "Upstreams & TLS" },
  { label: "Cache", href: "#cache", description: "Answer cache" },
];

const OVERVIEW_WINDOWS: MonitorWindow[] = ["10m", "1h", "24h"];

const RESPONSE_ARRAY_KEYS = [
  "items",
  "data",
  "rows",
  "result",
  "results",
  "list",
  "users",
  "policies",
  "overrides",
  "alerts",
  "entries",
  "hot_domains",
  "hotDomains",
  "devices",
] as const;

const TRAFFIC_SLICE_COLORS: Record<string, string> = {
  allow: "hsl(var(--primary))",
  block: "hsl(var(--destructive))",
  rewrite: "hsl(var(--secondary))",
  error: "hsl(var(--muted-foreground))",
  udp: "hsl(var(--primary))",
  tcp: "hsl(var(--secondary))",
  default: "hsl(var(--muted-foreground))",
};

const getTrafficSliceColor = (label: string) => TRAFFIC_SLICE_COLORS[label.toLowerCase()] ?? TRAFFIC_SLICE_COLORS.default;

type HealthCardMeta = {
  label: string;
  icon: LucideIcon;
  iconBg: string;
  badge: string;
  card?: string;
  description?: string;
};

const HEALTH_STATUS_META: Record<MonitorHealthBadge["status"], HealthCardMeta> = {
  healthy: {
    label: "Healthy",
    icon: CheckCircle2,
    iconBg: "bg-emerald-50 text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
    card: "hover:border-emerald-200",
  },
  degraded: {
    label: "Degraded",
    icon: Activity,
    iconBg: "bg-amber-50 text-amber-600",
    badge: "bg-amber-100 text-amber-700",
    card: "hover:border-amber-200",
  },
  warning: {
    label: "Warning",
    icon: AlertTriangle,
    iconBg: "bg-rose-50 text-rose-600",
    badge: "bg-rose-100 text-rose-700",
    card: "hover:border-rose-200",
  },
};

const HEALTH_CARD_PLACEHOLDER: HealthCardMeta = {
  label: "Pending",
  icon: AlertCircle,
  iconBg: "bg-slate-100 text-slate-500",
  badge: "border border-dashed border-slate-200 text-slate-500",
  card: "border-dashed",
  description: "Connect a health source to fill this slot.",
};

const coerceArray = <T,>(input: unknown, options?: { allowObjectValues?: boolean }): T[] => {
  if (!input) return [];
  if (Array.isArray(input)) return input as T[];
  if (typeof input === "object") {
    const record = input as Record<string, unknown>;
    for (const key of RESPONSE_ARRAY_KEYS) {
      if (Array.isArray(record[key])) {
        return record[key] as T[];
      }
    }
    if (options?.allowObjectValues) {
      return Object.values(record) as T[];
    }
  }
  return [];
};

const SectionHeader = ({ title, description }: { title: string; description: string }) => (
  <div className="space-y-2">
    <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

const SurfaceCard = ({ className, ...props }: ComponentProps<typeof Card>) => (
  <Card className={cn("rounded-2xl border border-border/70 bg-card/95 shadow-none", className)} {...props} />
);

const AdminDashboard = () => {
  const usersQuery = useMonitorUsers();
  const appsQuery = useMonitorApps();

  return (
    <AdminShell navItems={ADMIN_NAV}>
      <section id="dashboard" className="space-y-8">
        <SectionHeader title="Dashboard" description="At-a-glance health and traffic" />
        <OverviewSection />
      </section>

      <section id="apps">
        <AppsSection query={appsQuery} />
      </section>

      <section id="alerts" className="space-y-8">
        <SectionHeader title="Alerts" description="Built-in monitoring rules" />
        <AlertsSection />
      </section>

      <section id="live-feed" className="space-y-8">
        <SectionHeader title="Live Feed" description="Realtime visibility & triage" />
        <LiveFeedSection />
      </section>

      <section id="users" className="space-y-8">
        <SectionHeader title="Users" description="Manage accounts & ownership" />
        <UsersSection query={usersQuery} />
      </section>

      <section id="devices" className="space-y-8">
        <SectionHeader title="Devices" description="Endpoint inventory" />
        <DevicesSection />
      </section>

      <section id="policies" className="space-y-8">
        <SectionHeader title="Policies" description="Content control" />
        <PoliciesSection />
      </section>

      <section id="overrides" className="space-y-8">
        <SectionHeader title="Overrides" description="Allow / block exceptions" />
        <OverridesSection />
      </section>

      <section id="health" className="space-y-8">
        <SectionHeader title="Health" description="Upstreams & TLS" />
        <HealthSection />
      </section>

      <section id="cache" className="space-y-8">
        <SectionHeader title="Cache" description="Savings & hot keys" />
        <CacheSection />
      </section>
    </AdminShell>
  );
};

const OverviewSection = () => {
  const [window, setWindow] = useState<MonitorWindow>("10m");
  const overviewQuery = useMonitorOverview(window);

  if (overviewQuery.isLoading) {
    return <Skeleton className="h-72 w-full" />;
  }

  if (overviewQuery.isError || !overviewQuery.data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Unable to load overview</AlertTitle>
        <AlertDescription>Check your API credentials or base URL.</AlertDescription>
      </Alert>
    );
  }

  const overview = overviewQuery.data;
  const normalizeTrafficSlices = (
    value?: Array<{ label: string; value: number; color?: string }> | Record<string, number>,
  ): Array<{ label: string; value: number; color?: string }> => {
    if (Array.isArray(value)) {
      return value.map((slice) => ({
        ...slice,
        color: slice.color ?? getTrafficSliceColor(slice.label),
      }));
    }
    if (value && typeof value === "object") {
      return Object.entries(value).map(([label, rawValue]) => ({
        label,
        value: Number(rawValue) || 0,
        color: getTrafficSliceColor(label),
      }));
    }
    return [];
  };

  const kpis = coerceArray<MonitorKpi>(overview.kpis, { allowObjectValues: true });
  const qpsSeries = coerceArray(overview.qps_vs_error, { allowObjectValues: true });
  const latencySeries = coerceArray(overview.latency_p95, { allowObjectValues: true });
  const trafficSplit = normalizeTrafficSlices(overview.traffic_split ?? overview.protocol_split);
  const healthBadges = coerceArray(overview.health_badges, { allowObjectValues: true });
  const quickLinks = coerceArray(overview.quick_links, { allowObjectValues: true });
  const displayHealthBadges = Array.from({ length: 4 }, (_, index) => healthBadges[index] ?? null);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-card/70 px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Window</span>
          <Select value={window} onValueChange={(value) => setWindow(value as MonitorWindow)}>
            <SelectTrigger className="w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OVERVIEW_WINDOWS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" className="ml-auto rounded-full px-4" onClick={() => overviewQuery.refetch()}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.length ? (
          kpis.map((kpi, index) => {
            const cardKey = kpi.key ?? `kpi-${index}`;
            return (
              <SurfaceCard key={cardKey}>
                <CardHeader className="space-y-1">
                  <CardDescription>{kpi.label}</CardDescription>
                  <CardTitle className="text-3xl">{kpi.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{kpi.helper ?? kpi.trend ?? ""}</p>
                </CardContent>
              </SurfaceCard>
            );
          })
        ) : (
          <SurfaceCard className="sm:col-span-2 xl:col-span-5">
            <CardHeader>
              <CardTitle>No KPI data</CardTitle>
              <CardDescription>Monitor API did not return KPI metrics.</CardDescription>
            </CardHeader>
          </SurfaceCard>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <SurfaceCard>
          <CardHeader>
            <CardTitle>Latency (last {overview.latency?.window ?? window})</CardTitle>
            <CardDescription>P50 / P95 / P99</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            {["p50", "p95", "p99"].map((key) => {
              const value =
                overview.latency?.[key as keyof typeof overview.latency] ?? 0

              return (
                <div key={key}>
                  <p className="text-xs uppercase text-muted-foreground">{key}</p>
                  <p className="text-2xl font-bold">
                    {Number(value).toFixed(2)} ms
                  </p>
                </div>
              )
            })}
          </CardContent>
        </SurfaceCard>


        <SurfaceCard>
          <CardHeader>
            <CardTitle>Cache Hit Ratio</CardTitle>
            <CardDescription>Answer cache savings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs uppercase text-muted-foreground">10 minutes</p>
              <Progress value={(overview.cache?.hit_ratio_10m ?? 0)} className="h-1.5 rounded-full" />
              <p className="text-sm font-semibold">{overview.cache?.hit_ratio_10m ?? 0}%</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">1 hour</p>
              <Progress value={(overview.cache?.hit_ratio_1h ?? 0)} className="h-1.5 rounded-full" />
              <p className="text-sm font-semibold">{overview.cache?.hit_ratio_1h ?? 0}%</p>
            </div>
          </CardContent>
        </SurfaceCard>

        <SurfaceCard>
          <CardHeader>
            <CardTitle>Secure Transport</CardTitle>
            <CardDescription>Handshake & TLS</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs uppercase text-muted-foreground">DoT Handshake</p>
              <p className="text-3xl font-bold">
                {Number(overview.handshake?.success_pct ?? 0).toFixed(2)}%
              </p> 
               <p className="text-xs text-muted-foreground">success (last {overview.handshake?.window ?? window})</p>
            </div>
            <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-3">
              <p className="text-xs uppercase text-muted-foreground">TLS cert ({overview.tls?.domain ?? "—"})</p>
              <p className="text-lg font-semibold">{overview.tls?.days_remaining ?? 0} days left</p>
              <Badge variant={overview.tls?.status === "ok" ? "default" : "destructive"}>Status: {overview.tls?.status ?? "unknown"}</Badge>
            </div>
          </CardContent>
        </SurfaceCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <SurfaceCard className="xl:col-span-2">
          <CardHeader>
            <CardTitle>QPS vs Error %</CardTitle>
            <CardDescription>Auto-refreshes every 10s</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                qps: { label: "QPS", color: "hsl(var(--primary))" },
                error: { label: "Error %", color: "hsl(var(--destructive))" },
              }}
            >
              <LineChart data={qpsSeries} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
                <XAxis dataKey="timestamp" hide />
                <YAxis yAxisId="left" stroke="var(--color-qps)" />
                <YAxis yAxisId="right" orientation="right" stroke="var(--color-error)" domain={[0, 5]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="qps" stroke="var(--color-qps)" strokeWidth={2} dot={false} yAxisId="left" />
                <Line
                  type="monotone"
                  dataKey="error_pct"
                  stroke="var(--color-error)"
                  strokeWidth={2}
                  dot={false}
                  yAxisId="right"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </SurfaceCard>

        <SurfaceCard>
          <CardHeader>
            <CardTitle>Latency P95</CardTitle>
            <CardDescription>
              {latencySeries.length ? `Last ${latencySeries.length * 5} minutes` : "No samples available"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ latency: { label: "P95", color: "hsl(var(--secondary))" } }}>
              <LineChart data={latencySeries} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
                <XAxis dataKey="timestamp" hide />
                <YAxis stroke="var(--color-latency)" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="p95" stroke="var(--color-latency)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </SurfaceCard>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <SurfaceCard>
          <CardHeader>
            <CardTitle>Traffic Split</CardTitle>
            <CardDescription>Allow · Block · Rewrite · Error</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              className="h-[220px]"
              config={{
                allow: { label: "Allow", color: "hsl(var(--primary))" },
                block: { label: "Block", color: "hsl(var(--destructive))" },
                rewrite: { label: "Rewrite", color: "hsl(var(--secondary))" },
              }}
            >
              <PieChart>
                <Pie data={trafficSplit} dataKey="value" nameKey="label" label>
                  {trafficSplit.map((slice) => (
                    <Cell key={slice.label} fill={slice.color ?? "hsl(var(--muted-foreground))"} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </SurfaceCard>

        <SurfaceCard className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Health Badges</CardTitle>
            <CardDescription>Subsystem status</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {displayHealthBadges.map((badge, index) => {
              const meta = badge ? HEALTH_STATUS_META[badge.status] : HEALTH_CARD_PLACEHOLDER;
              const Icon = meta.icon;
              return (
                <div
                  key={badge?.title ?? `health-placeholder-${index}`}
                  className={cn(
                    "flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
                    meta.card,
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", meta.iconBg)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold capitalize", meta.badge)}>
                      {meta.label}
                    </span>
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="text-sm font-semibold text-slate-900">{badge?.title ?? "Available slot"}</p>
                    <p className="text-sm text-slate-500">
                      {badge?.description ?? HEALTH_CARD_PLACEHOLDER.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </SurfaceCard>
      </div>

      {quickLinks.length ? (
        <SurfaceCard>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Jump into triage workflows</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {quickLinks.map((link) => (
              <Button key={link.label} variant="outline" size="sm" className="rounded-full px-4" asChild>
                <a href={link.href}>{link.label}</a>
              </Button>
            ))}
          </CardContent>
        </SurfaceCard>
      ) : null}

      {overview.empty_state ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Waiting for traffic</AlertTitle>
          <AlertDescription>{overview.empty_state}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
};

type AppsQueryProps = ReturnType<typeof useMonitorApps>;
type AppSort = "name" | "status" | "date";

const AppsSection = ({ query }: { query: AppsQueryProps }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<MonitorApp["status"] | "all">("all");
  const [sortBy, setSortBy] = useState<AppSort>("name");

  if (query.isLoading) {
    return <AppsSectionSkeleton />;
  }

  if (query.isError || !query.data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Could not load apps</AlertTitle>
        <AlertDescription>Please try again.</AlertDescription>
      </Alert>
    );
  }

  const apps = coerceArray<MonitorApp>(query.data?.items ?? query.data, { allowObjectValues: true });
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filtered = apps.filter((app) => {
    const matchesSearch = normalizedSearch
      ? app.name.toLowerCase().includes(normalizedSearch) || app.description.toLowerCase().includes(normalizedSearch)
      : true;
    const matchesStatus = statusFilter === "all" ? true : app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sorter: Record<AppSort, (a: MonitorApp, b: MonitorApp) => number> = {
    name: (a, b) => a.name.localeCompare(b.name),
    status: (a, b) => a.status.localeCompare(b.status),
    date: (a, b) => {
      const aTime = new Date(a.last_updated).getTime();
      const bTime = new Date(b.last_updated).getTime();
      return Number.isNaN(bTime) ? -1 : Number.isNaN(aTime) ? 1 : bTime - aTime;
    },
  };

  const sorted = [...filtered].sort(sorter[sortBy]);
  const statusOptions: Array<{ label: string; value: MonitorApp["status"] | "all" }> = [
    { label: "All statuses", value: "all" },
    { label: "Active", value: "active" },
    { label: "Paused", value: "paused" },
    { label: "Warning", value: "warning" },
    { label: "Error", value: "error" },
  ];

  const sortOptions: Array<{ label: string; value: AppSort }> = [
    { label: "Sort by: Name", value: "name" },
    { label: "Sort by: Status", value: "status" },
    { label: "Sort by: Last updated", value: "date" },
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Apps</h2>
          <p className="text-sm text-slate-500">Manage all connected apps and their statuses from this panel.</p>
        </div>
        <Button className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold sm:w-auto">
          <Plus className="h-4 w-4" />
          Add App
        </Button>
      </div>

      <div className="space-y-6 px-6 py-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search apps..."
              className="h-11 rounded-lg border-slate-200 bg-white pl-10 text-base text-slate-900 placeholder:text-slate-400 focus-visible:ring-primary"
            />
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as MonitorApp["status"] | "all")}>
              <SelectTrigger className="h-11 rounded-lg border-slate-200 text-sm text-slate-700 sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent align="end">
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as AppSort)}>
              <SelectTrigger className="h-11 rounded-lg border-slate-200 text-sm text-slate-700 sm:w-52">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent align="end">
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {sorted.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sorted.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-500">
              <Plus className="h-5 w-5" />
            </div>
            <p className="text-lg font-semibold text-slate-900">No apps yet</p>
            <p className="text-sm text-slate-500">Connect your first app to get started.</p>
            <Button className="rounded-lg px-4 py-2 text-sm font-semibold">
              <Plus className="mr-2 h-4 w-4" />
              Add App
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const statusStyles: Record<MonitorApp["status"], string> = {
  active: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  paused: "bg-amber-50 text-amber-700 border border-amber-100",
  warning: "bg-amber-50 text-amber-700 border border-amber-100",
  error: "bg-red-50 text-red-700 border border-red-100",
  disconnected: "bg-slate-100 text-slate-600 border border-slate-200",
};

const statusLabel: Record<MonitorApp["status"], string> = {
  active: "Active",
  paused: "Paused",
  warning: "Warning",
  error: "Error",
  disconnected: "Disconnected",
};

const formatAppDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
};

const AppAvatar = ({ label }: { label: string }) => {
  const initials = label
    .split(" ")
    .map((piece) => piece[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold uppercase text-primary">
      {initials}
    </div>
  );
};

const AppIconButton = ({ children, label }: { children: ReactNode; label: string }) => (
  <Button
    variant="ghost"
    size="icon"
    className="h-10 w-10 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
    aria-label={label}
    title={label}
  >
    {children}
  </Button>
);

const AppCard = ({ app }: { app: MonitorApp }) => {
  const infoItems = [
    { label: "Users", value: app.users.toLocaleString() },
    { label: "Last updated", value: formatAppDate(app.last_updated) },
    { label: "Type", value: app.surface === "external" ? "External" : "Internal" },
    app.category ? { label: "Category", value: app.category } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AppAvatar label={app.name} />
          <div>
            <p className="text-base font-semibold text-slate-900">{app.name}</p>
            <p className="text-sm text-slate-500">{app.description}</p>
          </div>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold capitalize", statusStyles[app.status])}>
          {statusLabel[app.status]}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {infoItems.map((item) => (
          <div key={item.label} className="space-y-1">
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className="text-sm font-medium text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          Created by <span className="font-medium text-slate-900">{app.created_by}</span>
          {app.created_at ? ` · ${formatAppDate(app.created_at)}` : ""}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button className="h-10 w-full rounded-lg px-4 text-sm font-semibold sm:w-auto">Manage</Button>
          <div className="flex gap-2">
            <AppIconButton label="Edit app">
              <PenLine className="h-4 w-4" />
            </AppIconButton>
            <AppIconButton label="Delete app">
              <Trash2 className="h-4 w-4" />
            </AppIconButton>
            <AppIconButton label="More actions">
              <MoreHorizontal className="h-4 w-4" />
            </AppIconButton>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppsSectionSkeleton = () => (
  <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Skeleton className="h-8 w-40 rounded-lg" />
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>
    <Skeleton className="h-11 w-full rounded-lg" />
    <div className="grid gap-4 md:grid-cols-2">
      <Skeleton className="h-64 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  </div>
);


const AlertsSection = () => {
  const alertsQuery = useMonitorAlerts();

  if (alertsQuery.isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (alertsQuery.isError || !alertsQuery.data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Alerts unavailable</AlertTitle>
        <AlertDescription>Unable to fetch alert feed.</AlertDescription>
      </Alert>
    );
  }

  const alerts = coerceArray<MonitorAlert>(alertsQuery.data?.items ?? alertsQuery.data);

  const formatAlertTimestamp = (value?: string) => {
    if (!value) return "Unknown";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "Unknown";
    }
    return formatDistanceToNowStrict(date, { addSuffix: true });
  };

  if (!alerts.length) {
    return (
      <SurfaceCard>
        <CardHeader>
          <CardTitle>No alerts</CardTitle>
          <CardDescription>All monitoring rules are passing.</CardDescription>
        </CardHeader>
      </SurfaceCard>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {alerts.map((alert, index) => (
        <SurfaceCard
          key={alert.id}
          className={cn(
            "relative overflow-hidden transition-colors",
            alert.severity === "critical" && "border-destructive/60",
            alert.severity === "warning" && "border-yellow-400/60",
            alert.severity === "info" && "border-primary/40",
          )}
        >
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant={alert.severity === "critical" ? "destructive" : alert.severity === "warning" ? "default" : "secondary"}>
                {alert.severity}
              </Badge>
              <CardTitle className="text-base">{alert.title}</CardTitle>
            </div>
            <CardDescription>{formatAlertTimestamp(alert.created_at)}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{alert.description}</p>
          </CardContent>
        </SurfaceCard>
      ))}
    </div>
  );
};

const LiveFeedSection = () => {
  const { toast } = useToast();
  const [live, setLive] = useState(true);
  const [filters, setFilters] = useState<QueryFeedFilters>({ limit: 100, order: "DESC", time_range: "5m" });
  const query = useMonitorQueryFeed(filters, { refetch: live });
  const exportMutation = useExportQueryFeed();
  const createOverride = useCreateOverride();
  const resolvedRows = coerceArray<QueryFeedRow>(query.data?.rows ?? query.data);
  const resolvedTotal = typeof query.data?.total === "number" ? query.data.total : resolvedRows.length;

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `query-feed-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({ title: "Export failed", description: "Unable to download CSV", variant: "destructive" });
    }
  };

  const applyFilter = (key: keyof QueryFeedFilters, value: string | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value === "all" ? undefined : value }));
  };

  const handleRowOverride = async (payload: CreateOverridePayload) => {
    try {
      await createOverride.mutateAsync(payload);
      toast({ title: "Override saved", description: `${payload.domain} → ${payload.action}` });
    } catch (error) {
      toast({ title: "Override failed", description: "Unable to update override", variant: "destructive" });
    }
  };

  return (
    <SurfaceCard>
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <Select value={filters.time_range} onValueChange={(value) => applyFilter("time_range", value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                {[
                  { label: "Last 5m", value: "5m" },
                  { label: "Last 10m", value: "10m" },
                  { label: "Last 1h", value: "1h" },
                ].map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.action || "all"} onValueChange={(value) => applyFilter("action", value === "all" ? undefined : value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                {[
                  { label: "All actions", value: "all" },
                  { label: "Allow", value: "allow" },
                  { label: "Block", value: "block" },
                  { label: "Rewrite", value: "rewrite" },
                  { label: "Error", value: "error" },
                ].map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.proto || "all"} onValueChange={(value) => applyFilter("proto", value === "all" ? undefined : value)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Proto" />
              </SelectTrigger>
              <SelectContent>
                {[
                  { label: "Any", value: "all" },
                  { label: "UDP", value: "UDP" },
                  { label: "TCP", value: "TCP" },
                  { label: "DoT", value: "DoT" },
                ].map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.rcode || "all"} onValueChange={(value) => applyFilter("rcode", value === "all" ? undefined : value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Rcode" />
              </SelectTrigger>
              <SelectContent>
                {[
                  { label: "Any", value: "all" },
                  { label: "NOERROR", value: "NOERROR" },
                  { label: "NXDOMAIN", value: "NXDOMAIN" },
                  { label: "SERVFAIL", value: "SERVFAIL" },
                ].map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Input
              placeholder="Domain contains..."
              className="w-full md:max-w-sm"
              value={filters.search ?? ""}
              onChange={(event) => applyFilter("search", event.target.value || undefined)}
            />

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-border/70 px-3 py-1 text-xs font-semibold text-muted-foreground">
                <Switch checked={live} onCheckedChange={setLive} id="live-toggle" />
                <label htmlFor="live-toggle">{live ? "Live" : "Paused"}</label>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full px-4"
                onClick={handleExport}
                disabled={exportMutation.isPending}
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {query.isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : query.isError || !query.data ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Feed unavailable</AlertTitle>
            <AlertDescription>Unable to load query feed.</AlertDescription>
          </Alert>
        ) : (
          <>
            <ScrollArea className="h-[360px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>User · Device</TableHead>
                    <TableHead>Client IP · ASN</TableHead>
                    <TableHead>Proto</TableHead>
                    <TableHead>QName · QType</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Served From</TableHead>
                    <TableHead>Latency</TableHead>
                    <TableHead>Rcode</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resolvedRows.map((row) => {
                    const servedFromLabel = row.served_from ? row.served_from.replace(/_/g, " ") : undefined;
                    return (
                      <TableRow key={row.id} className="text-sm">
                        <TableCell>{new Date(row.timestamp).toLocaleTimeString()}</TableCell>
                        <TableCell>
                          <p className="font-semibold">{row.user}</p>
                          <p className="text-xs text-muted-foreground">{row.device}</p>
                        </TableCell>
                        <TableCell>
                          <p>{row.client_ip}</p>
                          <p className="text-xs text-muted-foreground">{row.asn}</p>
                        </TableCell>
                        <TableCell>{row.proto}</TableCell>
                        <TableCell>
                          <p className="truncate font-medium" title={row.qname}>
                            {row.qname}
                          </p>
                          <p className="text-xs text-muted-foreground">{row.qtype}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getActionVariant(row.action)} className="capitalize">
                            {row.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold capitalize">{servedFromLabel ?? (row.upstream ? "upstream" : "—")}</p>
                          {row.upstream ? (
                            <p className="text-xs text-muted-foreground">{row.upstream}</p>
                          ) : null}
                        </TableCell>
                        <TableCell>{row.latency_ms} ms</TableCell>
                        <TableCell>{row.rcode}</TableCell>
                        <TableCell className="text-right">
                          <RowActions
                            qname={row.qname}
                            onAllow={() => handleRowOverride({ user_id: row.user_id ?? "", domain: row.qname, action: "allow" })}
                            onBlock={() => handleRowOverride({ user_id: row.user_id ?? "", domain: row.qname, action: "block" })}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
            <p className="mt-4 text-sm text-muted-foreground">{resolvedTotal} rows (adjust filters to refine).</p>
          </>
        )}
      </CardContent>
    </SurfaceCard>
  );
};

type UsersQueryProps = ReturnType<typeof useMonitorUsers>;

const UsersSection = ({ query }: { query: UsersQueryProps }) => {
  if (query.isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (query.isError || !query.data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Unable to load users</AlertTitle>
        <AlertDescription>Check API connectivity.</AlertDescription>
      </Alert>
    );
  }

  const users = coerceArray<MonitorUser>(query.data);

  return (
    <SurfaceCard>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>Accounts and ownership</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Devices</TableHead>
              <TableHead>Active Policy</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={user.id ?? `user-${index}`}>
                <TableCell>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </TableCell>
                <TableCell>{user.device_count}</TableCell>
                <TableCell>{user.active_policy}</TableCell>
                <TableCell>{user.last_activity}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "Admin" ? "default" : "secondary"}>{user.role}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </SurfaceCard>
  );
};

const DevicesSection = () => {
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const apiFilters = useMemo(
    () => ({
      platform: platformFilter === "all" ? undefined : platformFilter,
      status: statusFilter === "all" ? undefined : statusFilter,
    }),
    [platformFilter, statusFilter],
  );

  const devicesQuery = useMonitorDevices(apiFilters);

  if (devicesQuery.isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (devicesQuery.isError || !devicesQuery.data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Unable to load devices</AlertTitle>
      </Alert>
    );
  }

  const devices = coerceArray<MonitorUserDevice>(devicesQuery.data?.items ?? devicesQuery.data, { allowObjectValues: true });
  const platformOptions = [
    { label: "Any platform", value: "all" },
    { label: "iOS", value: "ios" },
    { label: "Android", value: "android" },
    { label: "Windows", value: "windows" },
    { label: "macOS", value: "mac" },
    { label: "Linux", value: "linux" },
    { label: "Other", value: "other" },
  ];
  const statusOptions = [
    { label: "Any status", value: "all" },
    { label: "Online", value: "online" },
    { label: "Offline", value: "offline" },
    { label: "Paused", value: "paused" },
  ];

  return (
    <SurfaceCard>
      <CardHeader>
        <div className="flex flex-wrap gap-3 rounded-2xl border border-border/70 bg-muted/30 p-3">
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              {platformOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Hostname</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead>Policy</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.map((device) => (
              <TableRow key={device.id}>
                <TableCell>
                  <p className="font-semibold">{device.name}</p>
                  <p className="text-xs text-muted-foreground">Owner: {device.user_name ?? "Unknown"}</p>
                </TableCell>
                <TableCell>{device.platform}</TableCell>
                <TableCell className="font-mono text-xs">{device.hostname}</TableCell>
                <TableCell>
                  <p>{device.last_seen ? new Date(device.last_seen).toLocaleTimeString() : "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    {device.ip || "—"} · {device.asn || "—"}
                  </p>
                </TableCell>
                <TableCell>{device.policy}</TableCell>
                <TableCell>
                  <Badge variant={device.status === "Online" ? "default" : "secondary"}>{device.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {!devices.length ? <p className="mt-4 text-sm text-muted-foreground">No devices for the selected filters.</p> : null}
      </CardContent>
    </SurfaceCard>
  );
};

const PoliciesSection = () => {
  const policiesQuery = useMonitorPolicies();
  const updatePolicy = useUpdatePolicy();
  const { toast } = useToast();
  const [selectedPolicy, setSelectedPolicy] = useState<MonitorPolicy | null>(null);
  const [formState, setFormState] = useState<Record<string, boolean>>({});

  const openEdit = (policy: MonitorPolicy) => {
    setSelectedPolicy(policy);
    setFormState({
      block_ads: policy.categories.includes("Ads"),
      block_malware: policy.categories.includes("Malware"),
      block_adult: policy.categories.includes("Adult"),
      block_social: policy.categories.includes("Social"),
      block_gambling: policy.categories.includes("Gambling"),
      enable_safe_search: policy.safe_search,
    });
  };

  const submitPolicy = async () => {
    if (!selectedPolicy) return;
    try {
      await updatePolicy.mutateAsync({ policyUserId: selectedPolicy.id, payload: formState });
      toast({ title: "Policy updated", description: selectedPolicy.name });
      setSelectedPolicy(null);
    } catch (error) {
      toast({ title: "Update failed", description: "Unable to update policy", variant: "destructive" });
    }
  };

  if (policiesQuery.isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (policiesQuery.isError || !policiesQuery.data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Policies unavailable</AlertTitle>
      </Alert>
    );
  }

  const policies = coerceArray<MonitorPolicy>(policiesQuery.data?.items ?? policiesQuery.data);
  const categoryOptions = coerceArray<string>(policiesQuery.data?.categories, { allowObjectValues: true });

  return (
    <>
      <SurfaceCard>
        <CardHeader>
          <CardTitle>Policies</CardTitle>
          <CardDescription>Manage SafeSearch and category filters</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>SafeSearch</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Devices</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>{policy.name}</TableCell>
                  <TableCell>{policy.owner}</TableCell>
                  <TableCell>
                    <Badge variant={policy.safe_search ? "default" : "secondary"}>{policy.safe_search ? "On" : "Off"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {policy.categories.map((category) => (
                        <Badge key={category} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{policy.device_count}</TableCell>
                  <TableCell>
                    <p>{new Date(policy.updated_at).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">by {policy.updated_by}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => openEdit(policy)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </SurfaceCard>

      <Dialog open={!!selectedPolicy} onOpenChange={() => setSelectedPolicy(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Policy</DialogTitle>
          </DialogHeader>
          {selectedPolicy ? (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={selectedPolicy.name} disabled />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-semibold">SafeSearch</p>
                  <p className="text-sm text-muted-foreground">Google, Bing, YouTube, DuckDuckGo</p>
                </div>
                <Switch
                  checked={formState.enable_safe_search}
                  onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, enable_safe_search: checked }))}
                />
              </div>
              <div className="space-y-2">
                <p className="font-semibold">Categories</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {categoryOptions.map((category) => (
                    <label key={category} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={Boolean(formState[`block_${category.toLowerCase()}` as keyof typeof formState])}
                        onCheckedChange={(checked) =>
                          setFormState((prev) => ({ ...prev, [`block_${category.toLowerCase()}`]: Boolean(checked) }))
                        }
                      />
                      Block {category}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedPolicy(null)}>
                  Cancel
                </Button>
                <Button onClick={submitPolicy} disabled={updatePolicy.isPending}>
                  Save changes
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
};

const OverridesSection = () => {
  const [filterUserId, setFilterUserId] = useState<string>("");
  const overridesQuery = useMonitorOverrides(filterUserId || undefined);
  const createOverride = useCreateOverride();
  const deleteOverride = useDeleteOverride();
  const { toast } = useToast();

  const handleCreate = async (payload: CreateOverridePayload) => {
    try {
      await createOverride.mutateAsync(payload);
      toast({ title: "Override saved", description: payload.domain });
    } catch (error) {
      toast({ title: "Override failed", description: "Unable to save override", variant: "destructive" });
    }
  };

  const handleDelete = async (overrideId: string) => {
    try {
      await deleteOverride.mutateAsync({ overrideId, userId: filterUserId || undefined });
      toast({ title: "Override removed" });
    } catch (error) {
      toast({ title: "Delete failed", description: "Unable to delete override", variant: "destructive" });
    }
  };

  if (overridesQuery.isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (overridesQuery.isError || !overridesQuery.data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Overrides unavailable</AlertTitle>
      </Alert>
    );
  }

  const overrides = coerceArray(overridesQuery.data?.items ?? overridesQuery.data);

  return (
    <SurfaceCard>
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/30 p-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">User ID</Label>
            <Input
              value={filterUserId}
              onChange={(event) => setFilterUserId(event.target.value)}
              placeholder="Filter by user"
              className="w-full sm:w-48"
            />
          </div>
          <Button variant="outline" size="sm" className="rounded-full px-4" onClick={() => overridesQuery.refetch()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        <AddOverrideDialog onSubmit={handleCreate} />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Hits (24h)</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {overrides.map((entry, index) => (
              <TableRow key={entry.id ?? `override-${index}`}>
                <TableCell>{entry.domain}</TableCell>
                <TableCell>
                  <Badge variant={entry.action === "allow" ? "secondary" : "destructive"}>{entry.action}</Badge>
                </TableCell>
                <TableCell>{entry.scope}</TableCell>
                <TableCell>{entry.scope_target}</TableCell>
                <TableCell>{entry.hits_last_24h}</TableCell>
                <TableCell>{new Date(entry.created_at).toLocaleString()}</TableCell>
                <TableCell>{entry.expires_at ? new Date(entry.expires_at).toLocaleDateString() : "—"}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(entry.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </SurfaceCard>
  );
};

const AddOverrideDialog = ({ onSubmit }: { onSubmit: (payload: CreateOverridePayload) => Promise<void> }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateOverridePayload>({ user_id: "", domain: "", action: "allow" });

  const handleSubmit = async () => {
    await onSubmit(form);
    setOpen(false);
    setForm({ user_id: "", domain: "", action: "allow" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full px-4">
          <ShieldCheck className="mr-2 h-4 w-4" /> Add Override
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Override</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>User ID</Label>
            <Input value={form.user_id} onChange={(event) => setForm((prev) => ({ ...prev, user_id: event.target.value }))} />
          </div>
          <div>
            <Label>Domain</Label>
            <Input value={form.domain} onChange={(event) => setForm((prev) => ({ ...prev, domain: event.target.value }))} />
          </div>
          <div>
            <Label>Action</Label>
            <Select value={form.action} onValueChange={(value) => setForm((prev) => ({ ...prev, action: value as "allow" | "block" }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="allow">Allow</SelectItem>
                <SelectItem value="block">Block</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Expiry (optional)</Label>
            <Input type="date" value={form.expires_at ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, expires_at: event.target.value || undefined }))} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const HealthSection = () => {
  const upstreamsQuery = useMonitorUpstreams();
  const tlsQuery = useMonitorTlsStatus();

  if (upstreamsQuery.isLoading || tlsQuery.isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (upstreamsQuery.isError || tlsQuery.isError || !upstreamsQuery.data || !tlsQuery.data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Health data unavailable</AlertTitle>
      </Alert>
    );
  }

  const upstreams = upstreamsQuery.data;
  const tls = tlsQuery.data;
  const upstreamItems = upstreams.items ?? [];
  const upstreamSeries = upstreams.timeseries ?? [];
  const tlsErrors = tls.errors_last_24h ?? [];

  return (
    <Tabs defaultValue="upstreams" className="w-full">
      <TabsList>
        <TabsTrigger value="upstreams">Upstreams</TabsTrigger>
        <TabsTrigger value="tls">TLS</TabsTrigger>
      </TabsList>
      <TabsContent value="upstreams" className="space-y-4 pt-4">
        <ChartContainer
          config={{
            success: { label: "Success %", color: "hsl(var(--primary))" },
            latency: { label: "P95 latency", color: "hsl(var(--secondary))" },
          }}
        >
          <LineChart data={upstreamSeries} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
            <XAxis dataKey="timestamp" hide />
            <YAxis yAxisId="left" stroke="var(--color-success)" domain={[90, 100]} />
            <YAxis yAxisId="right" orientation="right" stroke="var(--color-latency)" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line dataKey="success_pct" stroke="var(--color-success)" strokeWidth={2} dot={false} yAxisId="left" />
            <Line dataKey="p95_latency_ms" stroke="var(--color-latency)" strokeWidth={2} dot={false} yAxisId="right" />
          </LineChart>
        </ChartContainer>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Success %</TableHead>
              <TableHead>Avg / P95 latency</TableHead>
              <TableHead>Last failure</TableHead>
              <TableHead>Retries today</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {upstreamItems.map((upstream) => (
              <TableRow key={upstream.id}>
                <TableCell>{upstream.name}</TableCell>
                <TableCell>
                  <Badge variant={upstream.status === "Healthy" ? "default" : "destructive"}>{upstream.status}</Badge>
                </TableCell>
                <TableCell>{upstream.success_pct}%</TableCell>
                <TableCell>
                  {upstream.avg_latency_ms} / {upstream.p95_latency_ms} ms
                </TableCell>
                <TableCell className="text-xs">{upstream.last_failure ?? "None"}</TableCell>
                <TableCell>{upstream.retries_today}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="tls" className="space-y-5 pt-4">
        <div className="grid gap-5 md:grid-cols-2">
          <SurfaceCard>
            <CardHeader>
              <CardTitle>TLS Certificate</CardTitle>
              <CardDescription>{tls.common_name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">SANs: {(tls.sans ?? []).join(", ") || "—"}</p>
              <p className="text-sm">
                Valid: {new Date(tls.not_before).toLocaleDateString()} → {new Date(tls.not_after).toLocaleDateString()}
              </p>
              <p className="text-lg font-bold">{tls.days_remaining} days remaining</p>
              <Badge variant={tls.chain_ok ? "default" : "destructive"}>{tls.chain_ok ? "Chain OK" : "Chain issue"}</Badge>
            </CardContent>
          </SurfaceCard>
          <SurfaceCard>
            <CardHeader>
              <CardTitle>Renewal Timeline</CardTitle>
              <CardDescription>guard.wequitech.com:853</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>Last renewal: {new Date(tls.last_renewal).toLocaleString()}</p>
              <p>Next scheduled: {new Date(tls.next_renewal).toLocaleString()}</p>
              <div>
                <p className="text-sm font-semibold">Errors (24h)</p>
                <div className="flex flex-wrap gap-2">
                  {tlsErrors.map((error) => (
                    <Badge key={error.label} variant={error.count ? "destructive" : "secondary"}>
                      {error.label}: {error.count}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button variant="outline">Run handshake test now</Button>
            </CardContent>
          </SurfaceCard>
        </div>
      </TabsContent>
    </Tabs>
  );
};

const CacheSection = () => {
  const [window, setWindow] = useState<MonitorWindow>("1h");
  const cacheQuery = useMonitorCacheMetrics(window);

  if (cacheQuery.isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (cacheQuery.isError || !cacheQuery.data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Cache metrics unavailable</AlertTitle>
      </Alert>
    );
  }

  const cache = cacheQuery.data;
  const hotDomains = coerceArray<MonitorCacheHotDomain>(cache.hot_domains ?? (cache as unknown as { hotDomains?: MonitorCacheHotDomain[] })?.hotDomains);
  const latencyBreakdown = cache.latency_breakdown ?? { cache_ms: 0, upstream_ms: 0, policy_ms: 0 };
  const totalLatency = latencyBreakdown.cache_ms + latencyBreakdown.upstream_ms + latencyBreakdown.policy_ms;
  const segments = [
    { label: "Cache", value: latencyBreakdown.cache_ms, color: "bg-primary/80" },
    { label: "Upstream", value: latencyBreakdown.upstream_ms, color: "bg-secondary/80" },
    { label: "Policy", value: latencyBreakdown.policy_ms, color: "bg-accent/80" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-muted/30 px-4 py-3">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Window</Label>
        <Select value={window} onValueChange={(value) => setWindow(value as MonitorWindow)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10m">10m</SelectItem>
            <SelectItem value="1h">1h</SelectItem>
            <SelectItem value="24h">24h</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <SurfaceCard>
          <CardHeader>
            <CardTitle>Hit Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs uppercase text-muted-foreground">10m</p>
            <p className="text-3xl font-bold">{cache.hit_ratio_10m}%</p>
            <p className="mt-4 text-xs uppercase text-muted-foreground">1h</p>
            <p className="text-xl font-semibold">{cache.hit_ratio_1h}%</p>
          </CardContent>
        </SurfaceCard>
        <SurfaceCard>
          <CardHeader>
            <CardTitle>Items & Evictions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{Number(cache.items_cached ?? 0).toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Items cached</p>
            <p className="mt-4 text-xl font-semibold">{cache.evictions_per_min}/min</p>
            <p className="text-sm text-muted-foreground">Evictions</p>
          </CardContent>
        </SurfaceCard>
        <SurfaceCard>
          <CardHeader>
            <CardTitle>Negative hits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{cache.negative_hits}</p>
            <p className="text-sm text-muted-foreground">NXDOMAIN caching reduces upstream load</p>
          </CardContent>
        </SurfaceCard>
      </div>

      <SurfaceCard>
        <CardHeader>
          <CardTitle>Top Hot Domains</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Hits (10m)</TableHead>
                <TableHead>Hits (1h)</TableHead>
                <TableHead>Avg TTL</TableHead>
                <TableHead>Last Hit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotDomains.map((domain) => (
                <TableRow key={domain.domain}>
                  <TableCell>{domain.domain}</TableCell>
                  <TableCell>{domain.hits_10m}</TableCell>
                  <TableCell>{domain.hits_1h}</TableCell>
                  <TableCell>{domain.avg_ttl_seconds}s</TableCell>
                  <TableCell>{domain.last_hit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </SurfaceCard>

      <SurfaceCard>
        <CardHeader>
          <CardTitle>Latency Breakdown (10m)</CardTitle>
          <CardDescription>Cache vs Upstream vs Policy time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex h-6 overflow-hidden rounded-full border border-border/70 bg-muted/30">
            {segments.map((segment) => (
              <div
                key={segment.label}
                className={cn(segment.color, "flex items-center justify-center text-[10px] text-white")}
                style={{ width: `${totalLatency ? (segment.value / totalLatency) * 100 : 0}%` }}
              >
                {segment.label}
              </div>
            ))}
          </div>
          <div className="flex gap-4 text-sm">
            {segments.map((segment) => (
              <span key={segment.label} className="flex items-center gap-1">
                <span className={cn("h-2 w-2 rounded", segment.color)} />
                {segment.label}: {segment.value} ms
              </span>
            ))}
          </div>
        </CardContent>
      </SurfaceCard>

      <Alert variant="destructive">
        <ShieldOff className="h-4 w-4" />
        <AlertTitle>Admin-only action</AlertTitle>
        <AlertDescription>Flush operations require Admin role. Analysts have read-only access.</AlertDescription>
      </Alert>
    </div>
  );
};

const RowActions = ({ qname, onAllow, onBlock }: { qname: string; onAllow: () => void; onBlock: () => void }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="rounded-full" aria-label="Domain actions" title="Domain actions">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={onAllow}>Allow domain</DropdownMenuItem>
      <DropdownMenuItem onClick={onBlock}>Block domain</DropdownMenuItem>
      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(qname)}>Copy domain</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const getActionVariant = (action: string) => {
  switch (action) {
    case "allow":
      return "secondary";
    case "block":
      return "destructive";
    case "rewrite":
      return "default";
    default:
      return "outline";
  }
};

export default AdminDashboard;
