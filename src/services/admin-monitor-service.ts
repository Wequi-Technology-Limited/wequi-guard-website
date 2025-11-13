import { adminApiClient } from "@/lib/admin-api-client";
import type {
  CreateOverridePayload,
  MonitorAlertsApiResponse,
  MonitorAlertsResponse,
  MonitorCacheApiResponse,
  MonitorCacheResponse,
  MonitorOverviewApiResponse,
  MonitorOverviewResponse,
  MonitorPoliciesApiResponse,
  MonitorPoliciesResponse,
  MonitorOverridesApiResponse,
  MonitorOverridesResponse,
  MonitorTlsApiResponse,
  MonitorTlsResponse,
  MonitorUpstreamsApiResponse,
  MonitorUpstreamsResponse,
  MonitorUsersApiResponse,
  MonitorUsersResponse,
  MonitorWindow,
  QueryFeedRow,
  QueryFeedApiResponse,
  QueryFeedFilters,
  QueryFeedResponse,
  UpdatePolicyPayload,
} from "@/types/admin";

const BASE = "/api/v1/admin/monitor";

const toTitle = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const ratioToPercent = (value?: number | null) => Math.round(((value ?? 0) * 100 + Number.EPSILON) * 10) / 10;

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

  const sparkline = payload.sparkline?.qps ?? [];
  const qps_vs_error = sparkline.map((bucket) => ({
    timestamp: bucket.bucket,
    qps: bucket.count,
    error_pct: payload.kpis?.error_pct ?? 0,
  }));
  const latency_p95 = sparkline.length
    ? sparkline.map((bucket) => ({ timestamp: bucket.bucket, p95: payload.latency?.p95 ?? 0 }))
    : [{ timestamp: generatedAt, p95: payload.latency?.p95 ?? 0 }];

  const protocol_split = Object.entries(payload.protocol_split ?? {}).map(([key, value]) => ({
    label: toTitle(key),
    value: Number(value ?? 0),
  }));

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
          description: payload.health.queue.details ? JSON.stringify(payload.health.queue.details) : "",
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
      domain: payload.health?.tls?.common_name ?? "",
      days_remaining: payload.health?.tls?.days_remaining ?? 0,
      expires_on: payload.health?.tls?.not_after ?? "",
      status: payload.health?.tls ? "ok" : "warning",
    },
    qps_vs_error,
    latency_p95,
    protocol_split,
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
    proto: (row.proto ?? "UDP") as QueryFeedRow["proto"],
    qname: row.domain ?? row.qname ?? "",
    qtype: row.query_type ?? row.qtype ?? "A",
    action: (row.action ?? (row.blocked ? "block" : "allow")) as QueryFeedRow["action"],
    upstream: row.upstream ?? "",
    latency_ms: row.latency_ms ?? 0,
    rcode: row.blocked ? "NXDOMAIN" : "NOERROR",
  }));

  return { rows, total: payload.pagination?.total ?? rows.length };
};

const transformUsers = (payload: MonitorUsersApiResponse): MonitorUsersResponse => {
  const items = (payload.users ?? []).map((user) => ({
    id: String(user.id),
    name: user.username ?? user.name ?? `User ${user.id}`,
    email: user.email ?? "",
    role: user.is_active === false ? "Analyst" : "Admin",
    last_activity: user.last_seen ?? user.created_at ?? "",
    active_policy: user.preferences ? "Custom" : "Default",
    device_count: user.device_count ?? 0,
    devices: [],
  }));

  return { items };
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
  const items = (payload.servers ?? []).map((server, index) => ({
    id: server.address ?? String(index),
    name: server.address ?? `Server ${index + 1}`,
    status: server.healthy === false ? "Unhealthy" : "Healthy",
    success_pct: server.success_pct ?? 0,
    avg_latency_ms: server.weight ?? 0,
    p95_latency_ms: server.successes ?? 0,
    last_failure: server.last_check,
    retries_today: server.failures ?? 0,
  }));

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

const transformCache = (payload: MonitorCacheApiResponse): MonitorCacheResponse => {
  const cache = payload.cache ?? {};
  const latencyBreakdown = payload.latency_breakdown ?? [];
  const getLatency = (source: string) => latencyBreakdown.find((entry) => entry.source === source)?.avg_ms ?? 0;

  return {
    hit_ratio_10m: ratioToPercent(cache.hit_ratio),
    hit_ratio_1h: ratioToPercent(cache.hit_ratio),
    items_cached: cache.size ?? 0,
    evictions_per_min: cache.expired ?? 0,
    negative_hits: cache.misses ?? 0,
    hot_domains: (payload.top_hot_domains ?? []).map((domain) => ({
      domain: domain.domain,
      hits_10m: domain.hits,
      hits_1h: domain.hits,
      avg_ttl_seconds: cache.default_ttl ?? 0,
      last_hit: domain.last_hit ?? "",
    })),
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

  getUsers: async () => {
    const response = await adminApiClient.get<MonitorUsersApiResponse>(`${BASE}/users`);
    return transformUsers(response);
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
    const response = await adminApiClient.get<MonitorCacheApiResponse>(`${BASE}/cache`, { params: { window } });
    return transformCache(response);
  },

  getAlerts: async () => {
    const response = await adminApiClient.get<MonitorAlertsApiResponse>(`${BASE}/alerts`);
    return transformAlerts(response);
  },
};
