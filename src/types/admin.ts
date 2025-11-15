export type MonitorWindow = "10m" | "1h" | "24h";

const COLLECTION_KEYS = [
  "items",
  "data",
  "rows",
  "result",
  "results",
  "list",
  "entries",
  "alerts",
  "hot_domains",
  "hotDomains",
  "users",
  "policies",
  "overrides",
  "devices",
  "apps",
] as const;

type CollectionKey = (typeof COLLECTION_KEYS)[number];

type CollectionEnvelope<T> = {
  [K in CollectionKey]?: T[];
} & {
  [key: string]: unknown;
};

export type ApiCollectionResponse<T, Extra extends Record<string, unknown> = Record<string, never>> =
  | (CollectionEnvelope<T> & Extra)
  | (T[] & Extra);

export interface MonitorKpi {
  key: string;
  label: string;
  value: string;
  helper?: string;
  trend?: string;
}

export interface MonitorLatencySummary {
  p50: number;
  p95: number;
  p99: number;
  window: string;
}

export interface MonitorCacheSummary {
  hit_ratio_10m: number;
  hit_ratio_1h: number;
}

export interface MonitorHandshakeSummary {
  success_pct: number;
  window: string;
}

export interface MonitorTlsSummary {
  domain: string;
  days_remaining: number;
  expires_on: string;
  status: "ok" | "warning" | "critical";
}

export interface MonitorTimeseriesPoint {
  timestamp: string;
}

export interface MonitorQpsVsErrorPoint extends MonitorTimeseriesPoint {
  qps: number;
  error_pct: number;
}

export interface MonitorLatencyPoint extends MonitorTimeseriesPoint {
  p95: number;
}

export interface MonitorTrafficSlice {
  label: string;
  value: number;
  color?: string;
}

export interface MonitorHealthBadge {
  title: string;
  status: "healthy" | "degraded" | "warning";
  description: string;
}

export interface MonitorQuickLink {
  label: string;
  description: string;
  href: string;
}

export interface MonitorOverviewResponse {
  window: MonitorWindow;
  generated_at: string;
  kpis: MonitorKpi[];
  latency: MonitorLatencySummary;
  cache: MonitorCacheSummary;
  handshake: MonitorHandshakeSummary;
  tls: MonitorTlsSummary;
  qps_vs_error: MonitorQpsVsErrorPoint[];
  latency_p95: MonitorLatencyPoint[];
  protocol_split: MonitorTrafficSlice[];
  traffic_split?: MonitorTrafficSlice[];
  health_badges: MonitorHealthBadge[];
  quick_links?: MonitorQuickLink[];
  empty_state?: string;
}

export interface QueryFeedFilters {
  time_range?: "5m" | "10m" | "1h" | "custom";
  action?: "allow" | "block" | "rewrite" | "error";
  proto?: "UDP" | "TCP" | "DoT";
  search?: string;
  domain_suffix?: string;
  rcode?: string;
  served_from?: string;
  start?: string;
  end?: string;
  limit?: number;
  offset?: number;
  order?: "ASC" | "DESC";
}

export interface QueryFeedRow {
  id: string;
  timestamp: string;
  user: string;
  user_id?: string;
  device: string;
  device_id?: string;
  client_ip: string;
  asn: string;
  proto: "UDP" | "TCP" | "DoT";
  qname: string;
  qtype: string;
  action: "allow" | "block" | "rewrite" | "error";
  upstream: string;
  latency_ms: number;
  rcode: string;
  served_from?: string;
}

export type QueryFeedResponse = ApiCollectionResponse<QueryFeedRow, { total?: number }>;

export interface MonitorUserDevice {
  id: string;
  name: string;
  platform: string;
  hostname: string;
  last_seen: string;
  ip: string;
  asn: string;
  policy: string;
  status: "Online" | "Paused";
  user_id?: string;
  user_name?: string;
}

export interface MonitorUser {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Analyst";
  last_activity: string;
  active_policy: string;
  device_count: number;
  devices?: MonitorUserDevice[];
}

export type MonitorUsersResponse = ApiCollectionResponse<MonitorUser>;
export interface AdminAccountFilters {
  search?: string;
  role?: "consumer" | "analyst" | "admin";
  last_seen_since?: string;
  limit?: number;
  offset?: number;
}

export interface AdminDevicesFilters {
  search?: string;
  platform?: string;
  status?: string;
  policy_id?: string;
  limit?: number;
  offset?: number;
}

export interface MonitorPolicy {
  id: string;
  owner: string;
  name: string;
  safe_search: boolean;
  categories: string[];
  device_count: number;
  updated_at: string;
  updated_by: string;
}

export type MonitorPoliciesResponse = ApiCollectionResponse<MonitorPolicy, { categories?: string[] }>;

export interface UpdatePolicyPayload {
  block_ads?: boolean;
  block_malware?: boolean;
  block_adult?: boolean;
  block_social?: boolean;
  block_gambling?: boolean;
  enable_safe_search?: boolean;
  description?: string;
}

export interface MonitorOverride {
  id: string;
  user_id: string;
  user_name: string;
  domain: string;
  action: "allow" | "block";
  scope: "User" | "Device";
  scope_target: string;
  hits_last_24h: number;
  created_at: string;
  created_by: string;
  expires_at?: string;
}

export type MonitorOverridesResponse = ApiCollectionResponse<MonitorOverride>;

export interface CreateOverridePayload {
  user_id: string;
  domain: string;
  action: "allow" | "block";
  scope?: "User" | "Device";
  scope_target_id?: string;
  expires_at?: string;
}

export interface MonitorUpstream {
  id: string;
  name: string;
  status: "Healthy" | "Unhealthy";
  success_pct: number;
  avg_latency_ms: number;
  p95_latency_ms: number;
  last_failure?: string;
  retries_today: number;
}

export type MonitorUpstreamsResponse = ApiCollectionResponse<
  MonitorUpstream,
  { timeseries: Array<{ timestamp: string; success_pct: number; p95_latency_ms: number }> }
>;

export interface MonitorTlsResponse {
  common_name: string;
  sans: string[];
  not_before: string;
  not_after: string;
  days_remaining: number;
  chain_ok: boolean;
  last_renewal: string;
  next_renewal: string;
  errors_last_24h: Array<{ label: string; count: number }>;
}

export interface MonitorCacheHotDomain {
  domain: string;
  hits_10m: number;
  hits_1h: number;
  avg_ttl_seconds: number;
  last_hit: string;
}

export interface MonitorCacheResponse {
  hit_ratio_10m: number;
  hit_ratio_1h: number;
  items_cached: number;
  evictions_per_min: number;
  negative_hits: number;
  hot_domains: MonitorCacheHotDomain[];
  latency_breakdown: {
    cache_ms: number;
    upstream_ms: number;
    policy_ms: number;
  };
}

export interface MonitorAlert {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  created_at: string;
  acknowledged?: boolean;
}

export type MonitorAlertsResponse = ApiCollectionResponse<MonitorAlert>;

export type MonitorAppStatus = "active" | "paused" | "warning" | "error" | "disconnected";

export type MonitorAppSurface = "internal" | "external";

export interface MonitorApp {
  id: string;
  name: string;
  description: string;
  status: MonitorAppStatus;
  surface: MonitorAppSurface;
  users: number;
  last_updated: string;
  created_by: string;
  created_at: string;
  category?: string;
  icon?: string;
}

export type MonitorAppsResponse = ApiCollectionResponse<MonitorApp>;

export interface MonitorAppsApiResponse {
  apps?: Array<{
    id?: string | number;
    name?: string;
    description?: string;
    status?: string;
    surface?: string;
    active_users?: number;
    users?: number;
    last_updated?: string;
    updated_at?: string;
    created_at?: string;
    created_by?: string;
    category?: string;
    icon?: string;
  }>;
}

// Raw API payloads ----------------------------------------------------------

export interface MonitorOverviewApiResponse {
  window: MonitorWindow;
  generated_at?: string;
  kpis?: Record<string, number>;
  latency?: Partial<MonitorLatencySummary>;
  totals?: { total?: number; blocked?: number; rewrites?: number; errors?: number; [key: string]: number | undefined };
  cache?: { hit_ratio?: number; stats?: unknown; updated_at?: string };
  protocol_split?: Record<string, number>;
  sparkline?: { qps?: Array<{ bucket: string; count: number; errors?: number }> };
  pie?: Record<string, number>;
  health?: {
    upstream_pool?: number;
    db?: { status?: string };
    queue?: { status?: string; details?: unknown };
    tls?: {
      common_name?: string;
      not_before?: string;
      not_after?: string;
      days_remaining?: number;
      sans?: string[];
    };
  };
}

export interface QueryFeedApiRow {
  id: string | number;
  user_id?: string | number;
  username?: string;
  user?: string;
  device?: string;
  device_id?: string | number;
  client_ip?: string;
  asn?: string;
  proto?: "UDP" | "TCP" | "DoT" | string;
  protocol?: string;
  domain?: string;
  qname?: string;
  query_type?: string;
  qtype?: string;
  action?: string;
  blocked?: boolean;
  latency_ms?: number;
  timestamp?: string;
  upstream?: string;
  rcode?: string;
  served_from?: string;
}

export interface QueryFeedApiResponse {
  data?: QueryFeedApiRow[];
  rows?: QueryFeedApiRow[];
  items?: QueryFeedApiRow[];
  pagination?: { limit?: number; offset?: number; total?: number };
}

export interface AdminAccountsApiResponse {
  data?: Array<{
    id: string | number;
    name?: string;
    username?: string;
    email?: string;
    role?: "consumer" | "analyst" | "admin";
    device_count?: number;
    last_seen?: string;
    last_login?: string;
    queries_24h?: number;
    policies?: string[];
  }>;
  pagination?: { limit?: number; offset?: number; total?: number };
}

export interface MonitorPoliciesApiResponse {
  policies?: Array<{
    user_id: string | number;
    username?: string;
    updated_at?: string;
    block_ads?: boolean;
    block_malware?: boolean;
    block_adult?: boolean;
    block_social?: boolean;
    block_gambling?: boolean;
    enable_safe_search?: boolean;
  }>;
}

export interface MonitorOverridesApiResponse {
  overrides?: Array<{
    id: string | number;
    user_id: string | number;
    domain: string;
    action: "allow" | "block";
    created_at?: string;
  }>;
}

export interface MonitorUpstreamsApiResponse {
  summary?: { total?: number; healthy?: number };
  servers?: Array<{
    address: string;
    protocol?: string;
    healthy?: boolean;
    weight?: number;
    successes?: number;
    failures?: number;
    success_pct?: number;
    last_check?: string;
    avg_latency_ms?: number;
    p95_latency_ms?: number;
    latency_ms?: number;
  }>;
}

export interface MonitorTlsApiResponse {
  enabled?: boolean;
  certificate?: {
    common_name?: string;
    not_before?: string;
    not_after?: string;
    days_remaining?: number;
    sans?: string[];
  };
}

export interface MonitorCacheApiResponse {
  cache?: {
    size?: number;
    shard_count?: number;
    default_ttl?: number;
    hits?: number;
    misses?: number;
    inserts?: number;
    expired?: number;
    hit_ratio?: number;
  };
  top_hot_domains?: Array<{ domain: string; hits: number; last_hit?: string }>;
  latency_breakdown?: Array<{ source: string; avg_ms: number }>;
}

export interface MonitorAlertsApiResponse {
  alerts?: Array<{
    key: string;
    severity: "info" | "warning" | "critical";
    description: string;
    triggered_at: string;
  }>;
}

export interface AdminDevicesApiResponse {
  data?: Array<{
    id: string | number;
    user_id?: string | number;
    user_name?: string;
    name?: string;
    platform?: string;
    status?: string;
    dot_hostname?: string;
    hostname?: string;
    last_seen?: string;
    last_ip?: string;
    last_asn?: string;
    handshake_status?: string;
    handshake_failures?: number;
    policy?: string;
    queries_24h?: number;
    latency_p95?: number;
  }>;
  pagination?: { limit?: number; offset?: number; total?: number };
}
