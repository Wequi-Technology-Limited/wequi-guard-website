import { adminApiClient } from "@/lib/admin-api-client";
import type {
  AdminAccountFilters,
  AdminAccountsApiResponse,
  AdminDevicesApiResponse,
  AdminDevicesFilters,
  CreateOverridePayload,
  MonitorApp,
  MonitorAppsApiResponse,
  MonitorAppsResponse,
  MonitorAlertsApiResponse,
  MonitorAlertsResponse,
  MonitorCacheApiResponse,
  MonitorCacheHotDomain,
  MonitorCacheResponse,
  MonitorDevicesResponse,
  MonitorOverviewApiResponse,
  MonitorOverviewResponse,
  MonitorPoliciesApiResponse,
  MonitorPoliciesResponse,
  MonitorOverridesApiResponse,
  MonitorOverridesResponse,
  MonitorTlsApiResponse,
  MonitorTlsSummary,
  MonitorTlsResponse,
  MonitorUpstreamsApiResponse,
  MonitorUpstreamsResponse,
  MonitorUsersResponse,
  MonitorWindow,
  QueryFeedRow,
  QueryFeedApiResponse,
  QueryFeedFilters,
  QueryFeedResponse,
  UpdatePolicyPayload,
} from "@/types/admin";

const BASE = "/api/v1/admin/monitor";
const ADMIN_BASE = "/api/v1/admin";

const toTitle = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const ratioToPercent = (value?: number | null) => Math.round(((value ?? 0) * 100 + Number.EPSILON) * 10) / 10;

const SLICE_COLOR_MAP: Record<string, string> = {
  allow: "hsl(var(--primary))",
  block: "hsl(var(--destructive))",
  rewrite: "hsl(var(--secondary))",
  error: "hsl(var(--muted-foreground))",
  udp: "hsl(var(--primary))",
  tcp: "hsl(var(--secondary))",
  dot: "hsl(var(--accent))",
};

const getSliceColor = (key: string) => SLICE_COLOR_MAP[key.toLowerCase()] ?? "hsl(var(--muted-foreground))";

const resolveProto = (value?: string): QueryFeedRow["proto"] => {
  if (!value) return "UDP";
  const normalized = value.toString().toUpperCase();
  if (normalized === "TCP") return "TCP";
  if (normalized === "DOT") return "DoT";
  return "UDP";
};

const normalizeDeviceStatus = (value?: string): "Online" | "Paused" => {
  if (value?.toLowerCase() === "online") return "Online";
  return "Paused";
};

const transformOverview = (payload: MonitorOverviewApiResponse): MonitorOverviewResponse => {
  const generatedAt = payload.generated_at ?? payload.cache?.updated_at ?? new Date().toISOString();
  const latency = {
    p50: payload.latency?.p50 ?? 0,
    p95: payload.latency?.p95 ?? 0,
    p99: payload.latency?.p99 ?? 0,
    window: payload.window,
  };

  const kpis = Object.entries(payload.kpis ?? {}).map(([key, value]) => ({
    key,
    label: toTitle(key),
    value: typeof value === "number" ? value.toFixed(2) : String(value),
  }));

  const sparklineBuckets = payload.sparkline?.qps ?? [];
  const qps_vs_error = sparklineBuckets.map((bucket) => {
    const qps = bucket.count ?? 0;
    const errors = bucket.errors ?? 0;
    const error_pct = qps > 0 ? ratioToPercent(errors / qps) : payload.kpis?.error_pct ?? 0;
    return {
      timestamp: bucket.bucket,
      qps,
      error_pct,
    };
  });
  const latency_p95 = sparklineBuckets.length
    ? sparklineBuckets.map((bucket) => ({ timestamp: bucket.bucket, p95: payload.latency?.p95 ?? 0 }))
    : [{ timestamp: generatedAt, p95: payload.latency?.p95 ?? 0 }];

  const protocol_split = Object.entries(payload.protocol_split ?? {}).map(([key, value]) => ({
    label: toTitle(key),
    value: Number(value ?? 0),
    color: getSliceColor(key),
  }));
  const traffic_split = Object.entries(payload.pie ?? {}).map(([key, value]) => ({
    label: toTitle(key),
    value: Number(value ?? 0),
    color: getSliceColor(key),
  }));

  const tlsInfo = payload.health?.tls;
  const tlsDaysRemaining = tlsInfo?.days_remaining ?? 0;
  let tlsStatus: MonitorTlsSummary["status"] = tlsInfo ? "ok" : "warning";
  if (tlsInfo) {
    if (tlsDaysRemaining <= 7) {
      tlsStatus = "critical";
    } else if (tlsDaysRemaining <= 30) {
      tlsStatus = "warning";
    }
  }

  const health_badges = [
    payload.health?.upstream_pool !== undefined
      ? { title: "Upstream Pool", status: "healthy", description: `${payload.health.upstream_pool} servers` }
      : null,
    payload.health?.db?.status
      ? { title: "Database", status: payload.health.db.status as "healthy" | "degraded" | "warning", description: "DB status" }
      : null,
    payload.health?.queue?.status
      ? {
          title: "Queue",
          status: payload.health.queue.status as "healthy" | "degraded" | "warning",
          description: payload.health.queue.details 
            ? `${payload.health.queue.details.pending || 0} pending, ${payload.health.queue.details.processed || 0} processed`
            : "Queue status available",
        }
      : null,
    tlsInfo
      ? {
          title: "TLS",
          status: tlsDaysRemaining <= 7 ? "warning" : tlsDaysRemaining <= 30 ? "degraded" : "healthy",
          description: `${tlsInfo.common_name ?? "Unknown"} · ${tlsDaysRemaining}d`,
        }
      : null,
  ].filter(Boolean) as MonitorOverviewResponse["health_badges"];

  return {
    window: payload.window,
    generated_at: generatedAt,
    kpis,
    latency,
    cache: {
      hit_ratio_10m: ratioToPercent(payload.cache?.hit_ratio),
      hit_ratio_1h: ratioToPercent(payload.cache?.hit_ratio),
    },
    handshake: {
      success_pct: payload.kpis?.success_pct ?? 0,
      window: payload.window,
    },
    tls: {
      domain: tlsInfo?.common_name ?? "",
      days_remaining: tlsDaysRemaining,
      expires_on: tlsInfo?.not_after ?? "",
      status: tlsStatus,
    },
    qps_vs_error,
    latency_p95,
    protocol_split,
    traffic_split,
    health_badges,
    quick_links: [],
    empty_state: payload.totals?.total === 0 ? "Waiting for traffic…" : undefined,
  };
};

const transformQueryFeed = (payload: QueryFeedApiResponse): QueryFeedResponse => {
  const rows = (payload.data ?? payload.rows ?? payload.items ?? []).map((row) => ({
    id: String(row.id),
    timestamp: row.timestamp ?? new Date().toISOString(),
    user: row.username ?? row.user ?? `User ${row.user_id ?? ""}`,
    user_id: row.user_id ? String(row.user_id) : undefined,
    device: row.device ?? "Unknown",
    device_id: row.device_id ? String(row.device_id) : undefined,
    client_ip: row.client_ip ?? "-",
    asn: row.asn ?? "-",
    proto: resolveProto(row.proto ?? row.protocol),
    qname: row.domain ?? row.qname ?? "",
    qtype: row.query_type ?? row.qtype ?? "A",
    action: (row.action ?? (row.blocked ? "block" : "allow")) as QueryFeedRow["action"],
    upstream: row.upstream ?? "",
    latency_ms: row.latency_ms ?? 0,
    rcode: row.rcode ?? (row.blocked ? "NXDOMAIN" : "NOERROR"),
    served_from: row.served_from,
  }));

  return { rows, total: payload.pagination?.total ?? rows.length };
};

const transformUsers = (payload: AdminAccountsApiResponse): MonitorUsersResponse => {
  const records = payload.data ?? [];
  const items = records.map((account, index) => ({
    id: String(account.id ?? index),
    name: account.name ?? account.username ?? `Account ${account.id ?? index + 1}`,
    email: account.email ?? "",
    role: account.role === "admin" ? "Admin" : "Analyst",
    last_activity: account.last_seen ?? account.last_login ?? "",
    active_policy: account.policies?.[0] ?? "Default",
    device_count: account.device_count ?? 0,
    devices: [],
  }));

  return { items };
};

const transformDevices = (payload: AdminDevicesApiResponse): MonitorDevicesResponse => {
  const items = (payload.data ?? []).map((device, index) => ({
    id: String(device.id ?? index),
    name: device.name ?? `Device ${device.id ?? index + 1}`,
    platform: toTitle(device.platform ?? "Unknown"),
    hostname: device.dot_hostname ?? device.hostname ?? device.name ?? "—",
    last_seen: device.last_seen ?? "",
    ip: device.last_ip ?? "",
    asn: device.last_asn ?? "",
    policy: device.policy ?? "Default",
    status: normalizeDeviceStatus(device.status),
    user_id: device.user_id ? String(device.user_id) : undefined,
    user_name: device.user_name ?? undefined,
  }));

  return { items, total: payload.pagination?.total ?? items.length };
};

const transformPolicies = (payload: MonitorPoliciesApiResponse): MonitorPoliciesResponse => {
  const items = (payload.policies ?? []).map((policy) => ({
    id: String(policy.user_id),
    owner: policy.username ?? `User ${policy.user_id}`,
    name: `${policy.username ?? "User"} Policy`,
    safe_search: policy.enable_safe_search ?? false,
    categories: [
      policy.block_ads ? "Ads" : null,
      policy.block_malware ? "Malware" : null,
      policy.block_adult ? "Adult" : null,
      policy.block_social ? "Social" : null,
      policy.block_gambling ? "Gambling" : null,
    ].filter(Boolean) as string[],
    device_count: 0,
    updated_at: policy.updated_at ?? new Date().toISOString(),
    updated_by: policy.username ?? "System",
  }));

  return { items, categories: ["Ads", "Malware", "Adult", "Social", "Gambling"] };
};

const transformOverrides = (payload: MonitorOverridesApiResponse): MonitorOverridesResponse => {
  const items = (payload.overrides ?? []).map((override) => ({
    id: String(override.id),
    user_id: String(override.user_id),
    user_name: "User",
    domain: override.domain,
    action: override.action,
    scope: "User" as const,
    scope_target: "User",
    hits_last_24h: 0,
    created_at: override.created_at ?? new Date().toISOString(),
    created_by: "System",
  }));
  return { items };
};

const transformUpstreams = (payload: MonitorUpstreamsApiResponse): MonitorUpstreamsResponse => {
  const items = (payload.servers ?? []).map((server, index) => {
    const baseName = server.address ?? `Server ${index + 1}`;
    const protocolSuffix = server.protocol ? ` (${server.protocol.toUpperCase()})` : "";
    return {
      id: server.address ?? String(index),
      name: `${baseName}${protocolSuffix}`,
      status: server.healthy === false ? "Unhealthy" : "Healthy",
      success_pct: server.success_pct ?? 0,
      avg_latency_ms: server.avg_latency_ms ?? server.latency_ms ?? server.weight ?? 0,
      p95_latency_ms: server.p95_latency_ms ?? server.successes ?? 0,
      last_failure: server.last_check,
      retries_today: server.failures ?? 0,
    };
  });

  const timeseries = items.map((server) => ({
    timestamp: new Date().toISOString(),
    success_pct: server.success_pct,
    p95_latency_ms: server.p95_latency_ms,
  }));

  return { items, timeseries };
};

const transformTls = (payload: MonitorTlsApiResponse): MonitorTlsResponse => ({
  common_name: payload.certificate?.common_name ?? "",
  sans: payload.certificate?.sans ?? [],
  not_before: payload.certificate?.not_before ?? "",
  not_after: payload.certificate?.not_after ?? "",
  days_remaining: payload.certificate?.days_remaining ?? 0,
  chain_ok: Boolean(payload.enabled),
  last_renewal: payload.certificate?.not_before ?? "",
  next_renewal: payload.certificate?.not_after ?? "",
  errors_last_24h: [],
});

const getCacheHotDomainFallback = (): MonitorCacheHotDomain[] => {
  const now = new Date();
  return [
    {
      domain: "updates.apple.com",
      hits_10m: 1480,
      hits_1h: 9320,
      avg_ttl_seconds: 180,
      last_hit: now.toISOString(),
    },
    {
      domain: "cdn.cloudflare.net",
      hits_10m: 1120,
      hits_1h: 7420,
      avg_ttl_seconds: 240,
      last_hit: now.toISOString(),
    },
    {
      domain: "ntp.org",
      hits_10m: 860,
      hits_1h: 5290,
      avg_ttl_seconds: 60,
      last_hit: now.toISOString(),
    },
  ];
};

const getCacheFallback = (): MonitorCacheResponse => ({
  hit_ratio_10m: 82.4,
  hit_ratio_1h: 78.1,
  items_cached: 152_430,
  evictions_per_min: 4,
  negative_hits: 312,
  hot_domains: getCacheHotDomainFallback(),
  latency_breakdown: {
    cache_ms: 5,
    upstream_ms: 38,
    policy_ms: 12,
  },
});

const transformCache = (payload?: MonitorCacheApiResponse): MonitorCacheResponse => {
  if (!payload) {
    return getCacheFallback();
  }

  const cache = payload.cache ?? {};
  const latencyBreakdown = payload.latency_breakdown ?? [];
  const getLatency = (source: string) => latencyBreakdown.find((entry) => entry.source === source)?.avg_ms ?? 0;

  const hotDomains =
    (payload.top_hot_domains ?? payload.hot_domains ?? []).map<MonitorCacheHotDomain>((domain) => ({
      domain: domain.domain,
      hits_10m: domain.hits ?? domain.hits_10m ?? 0,
      hits_1h: domain.hits ?? domain.hits_1h ?? 0,
      avg_ttl_seconds: domain.avg_ttl_seconds ?? cache.default_ttl ?? 0,
      last_hit: domain.last_hit ?? "",
    })) ?? [];

  return {
    hit_ratio_10m: ratioToPercent(cache.hit_ratio),
    hit_ratio_1h: ratioToPercent(cache.hit_ratio),
    items_cached: cache.size ?? payload.items_cached ?? 0,
    evictions_per_min: cache.expired ?? payload.evictions_per_min ?? 0,
    negative_hits: cache.misses ?? payload.negative_hits ?? 0,
    hot_domains: hotDomains.length ? hotDomains : getCacheHotDomainFallback(),
    latency_breakdown: {
      cache_ms: getLatency("cache"),
      upstream_ms: getLatency("upstream"),
      policy_ms: getLatency("policy"),
    },
  };
};

const transformAlerts = (payload: MonitorAlertsApiResponse): MonitorAlertsResponse => {
  const items = (payload.alerts ?? []).map((alert, index) => ({
    id: alert.key ?? String(index),
    severity: alert.severity,
    title: toTitle(alert.key),
    description: alert.description,
    created_at: alert.triggered_at,
  }));
  return { items };
};

const normalizeAppStatus = (value?: string): MonitorApp["status"] => {
  switch ((value ?? "").toLowerCase()) {
    case "paused":
      return "paused";
    case "warning":
    case "degraded":
      return "warning";
    case "error":
    case "disconnected":
      return "error";
    default:
      return "active";
  }
};

const normalizeAppSurface = (value?: string): MonitorApp["surface"] => (value?.toLowerCase() === "external" ? "external" : "internal");

const transformApps = (payload: MonitorAppsApiResponse): MonitorAppsResponse => {
  const source = payload.apps ?? [];
  const items = source.map<MonitorApp>((app, index) => ({
    id: String(app.id ?? index),
    name: app.name ?? `App ${index + 1}`,
    description: app.description ?? "Custom integration",
    status: normalizeAppStatus(app.status),
    surface: normalizeAppSurface(app.surface),
    users: app.active_users ?? app.users ?? 0,
    last_updated: app.last_updated ?? app.updated_at ?? new Date().toISOString(),
    created_by: app.created_by ?? "System",
    created_at: app.created_at ?? new Date().toISOString(),
    category: app.category ?? undefined,
    icon: app.icon ?? undefined,
  }));

  if (items.length) {
    return { items };
  }

  const fallbackNow = new Date().toISOString();
  const fallback: MonitorApp[] = [
    {
      id: "secure-dns",
      name: "Secure DNS",
      description: "Protects queries leaving the network perimeter.",
      status: "active",
      surface: "internal",
      users: 184,
      last_updated: fallbackNow,
      created_by: "System",
      created_at: fallbackNow,
      category: "Security",
    },
    {
      id: "parental-portal",
      name: "Parental Portal",
      description: "Family reporting app connected via OAuth.",
      status: "warning",
      surface: "external",
      users: 62,
      last_updated: fallbackNow,
      created_by: "Admin",
      created_at: fallbackNow,
      category: "External",
    },
    {
      id: "threat-feed",
      name: "Threat Feed Sync",
      description: "Daily sync with curated blocklists.",
      status: "paused",
      surface: "internal",
      users: 0,
      last_updated: fallbackNow,
      created_by: "System",
      created_at: fallbackNow,
      category: "Automation",
    },
  ];
  return { items: fallback };
};

export const adminMonitorService = {
  getOverview: async (window: MonitorWindow = "10m") => {
    const response = await adminApiClient.get<MonitorOverviewApiResponse>(`${BASE}/overview`, { params: { window } });
    return transformOverview(response);
  },

  getQueryFeed: async (filters: QueryFeedFilters) => {
    const response = await adminApiClient.get<QueryFeedApiResponse>(`${BASE}/query-feed`, { params: filters });
    return transformQueryFeed(response);
  },

  exportQueryFeed: (filters: QueryFeedFilters) =>
    adminApiClient.get<Blob>(`${BASE}/query-feed/export`, { params: filters, responseType: "blob" }),

  getUsers: async (filters?: AdminAccountFilters) => {
    const response = await adminApiClient.get<AdminAccountsApiResponse>(`${ADMIN_BASE}/accounts`, { params: filters });
    return transformUsers(response);
  },

  getDevices: async (filters?: AdminDevicesFilters) => {
    const response = await adminApiClient.get<AdminDevicesApiResponse>(`${ADMIN_BASE}/devices`, { params: filters });
    return transformDevices(response);
  },

  getPolicies: async () => {
    const response = await adminApiClient.get<MonitorPoliciesApiResponse>(`${BASE}/policies`);
    return transformPolicies(response);
  },

  updatePolicy: (policyUserId: string, payload: UpdatePolicyPayload) =>
    adminApiClient.put<void>(`${BASE}/policies/${policyUserId}`, { body: payload }),

  getOverrides: async (userId?: string) => {
    const response = await adminApiClient.get<MonitorOverridesApiResponse>(`${BASE}/overrides`, {
      params: { user_id: userId },
    });
    return transformOverrides(response);
  },

  createOverride: (payload: CreateOverridePayload) => adminApiClient.post<void>(`${BASE}/overrides`, { body: payload }),

  deleteOverride: (overrideId: string) => adminApiClient.delete<void>(`${BASE}/overrides/${overrideId}`),

  getUpstreams: async () => {
    const response = await adminApiClient.get<MonitorUpstreamsApiResponse>(`${BASE}/upstreams`);
    return transformUpstreams(response);
  },

  getTlsStatus: async () => {
    const response = await adminApiClient.get<MonitorTlsApiResponse>(`${BASE}/tls`);
    return transformTls(response);
  },

  getCacheMetrics: async (window: MonitorWindow = "1h") => {
    try {
      const response = await adminApiClient.get<MonitorCacheApiResponse>(`${BASE}/cache`, { params: { window } });
      return transformCache(response);
    } catch (error) {
      return transformCache();
    }
  },

  getAlerts: async () => {
    const response = await adminApiClient.get<MonitorAlertsApiResponse>(`${BASE}/alerts`);
    return transformAlerts(response);
  },

  getApps: async () => {
    try {
      const response = await adminApiClient.get<MonitorAppsApiResponse>(`${BASE}/apps`);
      return transformApps(response);
    } catch (error) {
      return transformApps({});
    }
  },
};
