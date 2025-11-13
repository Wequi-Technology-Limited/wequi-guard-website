import { formatDistanceToNowStrict } from "date-fns";
import { useState } from "react";
import { AlertTriangle, Download, MoreHorizontal, RefreshCw, ShieldCheck, ShieldOff } from "lucide-react";

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
  useMonitorCacheMetrics,
  useMonitorOverview,
  useMonitorPolicies,
  useMonitorQueryFeed,
  useMonitorOverrides,
  useMonitorTlsStatus,
  useMonitorUpstreams,
  useMonitorUsers,
  useUpdatePolicy,
} from "@/hooks/useAdminMonitor";
import { cn } from "@/lib/utils";
import type {
  CreateOverridePayload,
  MonitorAlert,
  MonitorCacheHotDomain,
  MonitorKpi,
  MonitorPolicy,
  MonitorUser,
  MonitorUserDevice,
  MonitorWindow,
  QueryFeedFilters,
  QueryFeedRow,
} from "@/types/admin";
import { Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from "recharts";

const ADMIN_NAV = [
  { label: "Dashboard (Overview)", href: "#dashboard", description: "Traffic & health" },
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

const RESPONSE_ARRAY_KEYS = ["items", "data", "rows", "result", "results", "list", "users", "policies", "overrides", "alerts", "entries", "hot_domains", "hotDomains"] as const;

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
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-primary">{description}</p>
    <h2 className="text-2xl font-bold">{title}</h2>
  </div>
);

const AdminDashboard = () => {
  const usersQuery = useMonitorUsers();

  return (
    <AdminShell navItems={ADMIN_NAV}>
      <section id="dashboard" className="space-y-6">
        <SectionHeader title="Dashboard" description="At-a-glance health and traffic" />
        <OverviewSection />
      </section>

      <section id="alerts" className="space-y-6">
        <SectionHeader title="Alerts" description="Built-in monitoring rules" />
        <AlertsSection />
      </section>

      <section id="live-feed" className="space-y-6">
        <SectionHeader title="Live Feed" description="Realtime visibility & triage" />
        <LiveFeedSection />
      </section>

      <section id="users" className="space-y-6">
        <SectionHeader title="Users" description="Manage accounts & ownership" />
        <UsersSection query={usersQuery} />
      </section>

      <section id="devices" className="space-y-6">
        <SectionHeader title="Devices" description="Endpoint inventory" />
        <DevicesSection query={usersQuery} />
      </section>

      <section id="policies" className="space-y-6">
        <SectionHeader title="Policies" description="Content control" />
        <PoliciesSection />
      </section>

      <section id="overrides" className="space-y-6">
        <SectionHeader title="Overrides" description="Allow / block exceptions" />
        <OverridesSection />
      </section>

      <section id="health" className="space-y-6">
        <SectionHeader title="Health" description="Upstreams & TLS" />
        <HealthSection />
      </section>

      <section id="cache" className="space-y-6">
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
  const normalizeProtocolSplit = (
    value?: Array<{ label: string; value: number; color?: string }> | Record<string, number>,
  ): Array<{ label: string; value: number; color?: string }> => {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
      return Object.entries(value).map(([label, rawValue]) => ({ label, value: Number(rawValue) || 0 }));
    }
    return [];
  };

  const kpis = coerceArray<MonitorKpi>(overview.kpis, { allowObjectValues: true });
  const qpsSeries = coerceArray(overview.qps_vs_error, { allowObjectValues: true });
  const latencySeries = coerceArray(overview.latency_p95, { allowObjectValues: true });
  const protocolSplit = normalizeProtocolSplit(overview.protocol_split);
  const healthBadges = coerceArray(overview.health_badges, { allowObjectValues: true });
  const quickLinks = coerceArray(overview.quick_links, { allowObjectValues: true });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Label className="text-xs font-semibold uppercase">Window</Label>
        <Select value={window} onValueChange={(value) => setWindow(value as MonitorWindow)}>
          <SelectTrigger className="w-32">
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
        <Button variant="ghost" size="icon" onClick={() => overviewQuery.refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.length ? (
          kpis.map((kpi, index) => {
            const cardKey = kpi.key ?? `kpi-${index}`;
            return (
              <Card key={cardKey} className="shadow-sm">
                <CardHeader className="space-y-1">
                  <CardDescription>{kpi.label}</CardDescription>
                  <CardTitle className="text-3xl">{kpi.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{kpi.helper ?? kpi.trend ?? ""}</p>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="sm:col-span-2 xl:col-span-5">
            <CardHeader>
              <CardTitle>No KPI data</CardTitle>
              <CardDescription>Monitor API did not return KPI metrics.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Latency (last {overview.latency?.window ?? window})</CardTitle>
            <CardDescription>P50 / P95 / P99</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            {["p50", "p95", "p99"].map((key) => (
              <div key={key}>
                <p className="text-xs uppercase text-muted-foreground">{key}</p>
                <p className="text-2xl font-bold">{overview.latency?.[key as keyof typeof overview.latency] ?? 0} ms</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cache Hit Ratio</CardTitle>
            <CardDescription>Answer cache savings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs uppercase text-muted-foreground">10 minutes</p>
              <Progress value={(overview.cache?.hit_ratio_10m ?? 0)} className="h-2" />
              <p className="text-sm font-semibold">{overview.cache?.hit_ratio_10m ?? 0}%</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">1 hour</p>
              <Progress value={(overview.cache?.hit_ratio_1h ?? 0)} className="h-2" />
              <p className="text-sm font-semibold">{overview.cache?.hit_ratio_1h ?? 0}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Secure Transport</CardTitle>
            <CardDescription>Handshake & TLS</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs uppercase text-muted-foreground">DoT Handshake</p>
              <p className="text-3xl font-bold">{overview.handshake?.success_pct ?? 0}%</p>
              <p className="text-xs text-muted-foreground">success (last {overview.handshake?.window ?? window})</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs uppercase text-muted-foreground">TLS cert ({overview.tls?.domain ?? "—"})</p>
              <p className="text-lg font-semibold">{overview.tls?.days_remaining ?? 0} days left</p>
              <Badge variant={overview.tls?.status === "ok" ? "default" : "destructive"}>Status: {overview.tls?.status ?? "unknown"}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
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
        </Card>

        <Card>
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
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Traffic Split</CardTitle>
            <CardDescription>Allow vs Block vs Rewrite</CardDescription>
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
                <Pie data={protocolSplit} dataKey="value" nameKey="label" label>
                  {protocolSplit.map((slice) => (
                    <Cell key={slice.label} fill={slice.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Health Badges</CardTitle>
            <CardDescription>Subsystem status</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {healthBadges.map((badge) => (
              <div key={badge.title} className="rounded-lg border bg-card/60 p-4">
                <p className="text-xs uppercase text-muted-foreground">{badge.title}</p>
                <p className="text-xl font-semibold capitalize">{badge.status}</p>
                <p className="text-sm text-muted-foreground">{badge.description}</p>
              </div>
            ))}
            {!healthBadges.length ? <p className="text-sm text-muted-foreground">No health badges.</p> : null}
          </CardContent>
        </Card>
      </div>

      {quickLinks.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Jump into triage workflows</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {quickLinks.map((link) => (
              <Button key={link.label} variant="outline" size="sm" asChild>
                <a href={link.href}>{link.label}</a>
              </Button>
            ))}
          </CardContent>
        </Card>
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
      <Card>
        <CardHeader>
          <CardTitle>No alerts</CardTitle>
          <CardDescription>All monitoring rules are passing.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {alerts.map((alert, index) => (
        <Card key={alert.id} className="border-l-4" data-severity={alert.severity}>
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
        </Card>
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
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
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

          <Input
            placeholder="Domain contains..."
            className="w-64"
            value={filters.search ?? ""}
            onChange={(event) => applyFilter("search", event.target.value || undefined)}
          />

          <div className="flex flex-1 items-center justify-end gap-3">
            <div className="flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs">
              <Switch checked={live} onCheckedChange={setLive} id="live-toggle" />
              <label htmlFor="live-toggle">{live ? "Live" : "Paused"}</label>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={exportMutation.isPending}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
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
            <ScrollArea className="h-[360px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>User · Device</TableHead>
                    <TableHead>Client IP · ASN</TableHead>
                    <TableHead>Proto</TableHead>
                    <TableHead>QName · QType</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Upstream</TableHead>
                    <TableHead>Latency</TableHead>
                    <TableHead>Rcode</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resolvedRows.map((row) => (
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
                      <TableCell>{row.upstream}</TableCell>
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
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            <p className="mt-4 text-sm text-muted-foreground">{resolvedTotal} rows (adjust filters to refine).</p>
          </>
        )}
      </CardContent>
    </Card>
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
    <Card>
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
    </Card>
  );
};

const DevicesSection = ({ query }: { query: UsersQueryProps }) => {
  const users = coerceArray<MonitorUser>(query.data);
  const devices = users.flatMap((user) =>
    coerceArray<MonitorUserDevice>(user.devices, { allowObjectValues: true }).map((device) => ({
      ...device,
      userName: user.name ?? "Unknown",
    })),
  );

  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredDevices = devices.filter((device) => {
    const platformMatch = platformFilter === "all" || device.platform === platformFilter;
    const statusMatch = statusFilter === "all" || device.status === statusFilter;
    return platformMatch && statusMatch;
  });

  if (query.isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (query.isError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Unable to load devices</AlertTitle>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any platform</SelectItem>
              {["Android", "iOS", "Other"].map((platform) => (
                <SelectItem key={platform} value={platform}>
                  {platform}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any status</SelectItem>
              {["Online", "Paused"].map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
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
              {filteredDevices.map((device) => (
              <TableRow key={device.id}>
                <TableCell>
                  <p className="font-semibold">{device.name}</p>
                  <p className="text-xs text-muted-foreground">Owner: {device.userName}</p>
                </TableCell>
                <TableCell>{device.platform}</TableCell>
                <TableCell className="font-mono text-xs">{device.hostname}</TableCell>
                <TableCell>
                  <p>{new Date(device.last_seen).toLocaleTimeString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {device.ip} · {device.asn}
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
        {!filteredDevices.length ? <p className="mt-4 text-sm text-muted-foreground">No devices for the selected filters.</p> : null}
      </CardContent>
    </Card>
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
      <Card>
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
      </Card>

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
    <Card>
      <CardHeader className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label>User ID</Label>
          <Input value={filterUserId} onChange={(event) => setFilterUserId(event.target.value)} placeholder="Filter by user" className="w-48" />
          <Button variant="outline" size="sm" onClick={() => overridesQuery.refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
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
    </Card>
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
        <Button>
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

      <TabsContent value="tls" className="space-y-4 pt-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
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
          </Card>
          <Card>
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
          </Card>
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
      <div className="flex items-center gap-3">
        <Label>Window</Label>
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Hit Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs uppercase text-muted-foreground">10m</p>
            <p className="text-3xl font-bold">{cache.hit_ratio_10m}%</p>
            <p className="mt-4 text-xs uppercase text-muted-foreground">1h</p>
            <p className="text-xl font-semibold">{cache.hit_ratio_1h}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Items & Evictions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{Number(cache.items_cached ?? 0).toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Items cached</p>
            <p className="mt-4 text-xl font-semibold">{cache.evictions_per_min}/min</p>
            <p className="text-sm text-muted-foreground">Evictions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Negative hits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{cache.negative_hits}</p>
            <p className="text-sm text-muted-foreground">NXDOMAIN caching reduces upstream load</p>
          </CardContent>
        </Card>
      </div>

      <Card>
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
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Latency Breakdown (10m)</CardTitle>
          <CardDescription>Cache vs Upstream vs Policy time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex h-6 overflow-hidden rounded-full border">
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
      </Card>

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
      <Button variant="ghost" size="icon">
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
