import type { IconName } from "@/lib/icon-map";

export type AccentColor = "primary" | "secondary" | "accent";

export type DeviceType = "router" | "windows" | "mac" | "mobile";

export interface Cta {
  label: string;
  href: string;
  variant?: "default" | "secondary" | "outline";
}

export interface MediaAsset {
  src: string;
  alt: string;
}

export interface HeroContent {
  eyebrow?: string;
  title: string;
  description: string;
  primaryCta: Cta;
  secondaryCta?: Cta;
  media: MediaAsset;
}

export interface SocialProofItem {
  icon: IconName;
  label: string;
  description: string;
}

export interface ProcessStep {
  icon: IconName;
  title: string;
  description: string;
  accent: AccentColor;
}

export interface FinalCallToAction {
  heading: string;
  subheading: string;
  cta: Cta;
}

export interface Feature {
  title: string;
  description: string;
  icon: IconName;
  accent: AccentColor;
}

export interface HomeContent {
  hero: HeroContent;
  socialProof: SocialProofItem[];
  steps: ProcessStep[];
  finalCta: FinalCallToAction;
}

export interface FeatureContent {
  title: string;
  description: string;
  features: Feature[];
  supportingStatement: {
    title: string;
    description: string;
  };
}

export interface DnsServers {
  primary: string;
  secondary: string;
}

export interface InstructionCallout {
  label: string;
  value: string;
}

export interface InstructionStep {
  title: string;
  description: string;
  callouts?: InstructionCallout[];
}

export interface SetupSection {
  heading?: string;
  description?: string;
  steps: InstructionStep[];
}

export interface SetupGuide {
  id: DeviceType;
  name: string;
  icon: IconName;
  description: string;
  recommended?: boolean;
  sections: SetupSection[];
}

export interface TroubleshootingTip {
  title: string;
  description: string;
}

export interface SetupContent {
  dnsServers: DnsServers;
  guides: SetupGuide[];
  troubleshooting: TroubleshootingTip[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqContent {
  faqs: FaqItem[];
  contactEmail: string;
}

export interface AdminKpiCard {
  label: string;
  value: string;
  helper?: string;
  trend?: string;
}

export interface AdminLatencyCard {
  p50: number;
  p95: number;
  p99: number;
  window: string;
}

export interface AdminCacheHitRatio {
  tenMinutes: number;
  oneHour: number;
}

export interface AdminHandshakeCard {
  successRate: number;
  window: string;
}

export interface AdminTlsStatus {
  domain: string;
  daysRemaining: number;
  expiresOn: string;
  status: "ok" | "warning" | "critical";
}

export interface QpsErrorPoint {
  timestamp: string;
  qps: number;
  errorPercent: number;
}

export interface LatencyPoint {
  timestamp: string;
  p95: number;
}

export interface TrafficSlice {
  label: string;
  value: number;
  color: string;
}

export interface HealthBadge {
  title: string;
  status: "healthy" | "degraded" | "warning";
  description: string;
}

export interface QuickLink {
  label: string;
  description: string;
  href: string;
}

export interface LiveFeedRow {
  id: string;
  timestamp: string;
  user: string;
  device: string;
  clientIp: string;
  asn: string;
  proto: "UDP" | "TCP" | "DoT";
  qname: string;
  qtype: string;
  action: "allow" | "block" | "rewrite" | "error";
  upstream: string;
  latencyMs: number;
  rcode: string;
}

export interface UserRow {
  id: string;
  name: string;
  email: string;
  devices: number;
  policy: string;
  lastActivity: string;
  role: "Admin" | "Analyst";
}

export interface DeviceRow {
  id: string;
  name: string;
  platform: string;
  hostname: string;
  lastSeen: string;
  ip: string;
  asn: string;
  policy: string;
  status: "Online" | "Paused";
}

export interface PolicyRow {
  id: string;
  name: string;
  owner: string;
  safeSearch: boolean;
  categories: string[];
  devices: number;
  updatedAt: string;
  updatedBy: string;
}

export interface OverrideRow {
  id: string;
  domain: string;
  action: "allow" | "block";
  scope: "User" | "Device";
  target: string;
  hits: number;
  createdAt: string;
  createdBy: string;
  expiresAt?: string;
}

export interface UpstreamRow {
  id: string;
  name: string;
  status: "Healthy" | "Unhealthy";
  successRate: number;
  avgLatency: number;
  p95Latency: number;
  lastFailure?: string;
  retriesToday: number;
}

export interface HealthTimeseriesPoint {
  timestamp: string;
  successRate: number;
  p95Latency: number;
}

export interface TlsOverview {
  commonName: string;
  sans: string[];
  notBefore: string;
  notAfter: string;
  daysRemaining: number;
  chainOk: boolean;
  lastRenewal: string;
  nextRenewal: string;
  lastErrors: { label: string; count: number }[];
}

export interface CacheSummary {
  hitRatio10m: number;
  hitRatio1h: number;
  items: number;
  evictionsPerMin: number;
  negativeHits: number;
}

export interface CacheDomainRow {
  domain: string;
  hits10m: number;
  hits1h: number;
  avgTtl: number;
  lastHit: string;
}

export interface LatencyBreakdown {
  cacheMs: number;
  upstreamMs: number;
  policyMs: number;
}

export interface AdminDashboardData {
  overview: {
    kpis: AdminKpiCard[];
    latency: AdminLatencyCard;
    cacheHitRatio: AdminCacheHitRatio;
    handshake: AdminHandshakeCard;
    tls: AdminTlsStatus;
    charts: {
      qpsVsError: QpsErrorPoint[];
      latencyP95: LatencyPoint[];
      trafficSplit: TrafficSlice[];
    };
    healthBadges: HealthBadge[];
    quickLinks: QuickLink[];
    emptyState?: string;
  };
  liveFeed: {
    rows: LiveFeedRow[];
    filters: {
      timeRanges: string[];
      actions: Array<LiveFeedRow["action"]>;
      protocols: Array<LiveFeedRow["proto"]>;
      rcodes: string[];
    };
  };
  users: {
    items: UserRow[];
    roles: Array<UserRow["role"]>;
    lastActivityFilters: string[];
  };
  devices: {
    items: DeviceRow[];
    platforms: string[];
    statuses: Array<DeviceRow["status"]>;
    policies: string[];
  };
  policies: {
    items: PolicyRow[];
    categories: string[];
  };
  overrides: {
    items: OverrideRow[];
  };
  health: {
    upstreams: UpstreamRow[];
    tls: TlsOverview;
    timeseries: HealthTimeseriesPoint[];
  };
  cache: {
    summary: CacheSummary;
    hotDomains: CacheDomainRow[];
    latency: LatencyBreakdown;
  };
}
