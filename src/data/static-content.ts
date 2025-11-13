import heroImage from "@/assets/hero-shield.png";
import type {
  AdminDashboardData,
  FaqContent,
  FeatureContent,
  HomeContent,
  SetupContent,
} from "@/types/content";

export const dnsServers = {
  primary: "45.90.28.0",
  secondary: "45.90.30.0",
} as const;

export const homeContent: HomeContent = {
  hero: {
    title: "Take Back Control of Your Internet",
    description:
      "WequiGuard is a free, intelligent DNS filter that automatically blocks inappropriate content like pornography, gambling, and malicious websites across your entire home network.",
    primaryCta: { label: "Get Started for Free", href: "/setup", variant: "secondary" },
    secondaryCta: { label: "Learn More →", href: "/features", variant: "outline" },
    media: {
      src: heroImage,
      alt: "Digital protection shield with devices",
    },
  },
  socialProof: [
    { icon: "award", label: "Featured in TechFamily Magazine", description: "Industry trusted" },
    { icon: "users", label: "Families Worldwide", description: "Thousands protected" },
    { icon: "zap", label: "Parenting Choice Award 2024", description: "Independent recognition" },
  ],
  steps: [
    {
      icon: "shield",
      title: "Choose Your Protection Level",
      description: "Select from our pre-configured security filters tailored to your family's needs.",
      accent: "primary",
    },
    {
      icon: "settings",
      title: "Update Your DNS Settings",
      description: "Follow our guided walkthrough for your router or preferred device.",
      accent: "secondary",
    },
    {
      icon: "checkCircle",
      title: "Browse with Confidence",
      description: "WequiGuard silently protects your entire network with no slowdown.",
      accent: "accent",
    },
  ],
  finalCta: {
    heading: "Ready to Create a Safer Internet for Your Family?",
    subheading: "Join thousands of families protecting their digital lives with WequiGuard.",
    cta: { label: "Set Up WequiGuard Now", href: "/setup", variant: "secondary" },
  },
};

export const featureContent: FeatureContent = {
  title: "Powerful Protection, Simple Setup",
  description: "WequiGuard works at the network level, filtering content on every device connected to your Wi-Fi.",
  features: [
    {
      icon: "shieldBan",
      title: "Block Harmful Content",
      description: "Automatically block access to pornography, gambling, violent, and extremist material.",
      accent: "primary",
    },
    {
      icon: "search",
      title: "SafeSearch Enforcement",
      description: "Force SafeSearch on Google, Bing, DuckDuckGo, and other popular search engines.",
      accent: "secondary",
    },
    {
      icon: "shieldCheck",
      title: "Malware & Phishing Protection",
      description: "DNS filtering keeps known malicious domains away from your household devices.",
      accent: "accent",
    },
    {
      icon: "lock",
      title: "No Tracking, Total Privacy",
      description: "We do not log browsing history or sell data—privacy is a foundational principle.",
      accent: "primary",
    },
    {
      icon: "laptop",
      title: "Works on All Devices",
      description: "Protect phones, laptops, tablets, smart TVs, consoles, and IoT devices without extra installs.",
      accent: "secondary",
    },
    {
      icon: "dollarSign",
      title: "Completely Free",
      description: "WequiGuard remains a free service because online safety should be accessible to everyone.",
      accent: "accent",
    },
  ],
  supportingStatement: {
    title: "Network-Level Protection That Just Works",
    description:
      "Unlike browser extensions or apps, WequiGuard protects at the DNS layer so every device connected to your network is automatically covered—no installs required.",
  },
};

export const setupContent: SetupContent = {
  dnsServers,
  guides: [
    {
      id: "router",
      name: "Router",
      icon: "router",
      description: "Protect every device on your Wi-Fi network in one go.",
      recommended: true,
      sections: [
        {
          steps: [
            {
              title: "Access your router's admin panel",
              description: "Open a browser, enter your router IP (e.g., 192.168.1.1), and log in with your admin credentials.",
            },
            {
              title: "Find DNS or Internet settings",
              description: "Look for DNS, Network, Internet, or WAN sections—naming varies per router brand.",
            },
            {
              title: "Enter the WequiGuard DNS servers",
              description: "Replace existing DNS entries with the addresses below, then save.",
              callouts: [
                { label: "Primary DNS", value: dnsServers.primary },
                { label: "Secondary DNS", value: dnsServers.secondary },
              ],
            },
            {
              title: "Save and restart",
              description: "Apply the changes and restart the router if prompted to activate protection for all devices.",
            },
          ],
        },
      ],
    },
    {
      id: "windows",
      name: "Windows",
      icon: "laptop",
      description: "Configure DNS on a single Windows computer.",
      sections: [
        {
          steps: [
            {
              title: "Open Network Connections",
              description: "Right-click the network icon → Open Network & Internet Settings → Advanced network settings.",
            },
            {
              title: "Edit adapter options",
              description: "Choose Wi-Fi or Ethernet → Properties → Internet Protocol Version 4 (TCP/IPv4).",
            },
            {
              title: "Use the DNS servers below",
              description: "Select \"Use the following DNS server addresses\" and enter the WequiGuard values.",
              callouts: [
                { label: "Preferred DNS", value: dnsServers.primary },
                { label: "Alternate DNS", value: dnsServers.secondary },
              ],
            },
            {
              title: "Confirm and restart",
              description: "Click OK to save, then restart your browser to ensure the new settings apply.",
            },
          ],
        },
      ],
    },
    {
      id: "mac",
      name: "macOS",
      icon: "laptop",
      description: "Configure DNS on any modern Mac.",
      sections: [
        {
          steps: [
            {
              title: "Open System Settings",
              description: "Apple menu → System Settings (or System Preferences on older versions).",
            },
            {
              title: "Select Network",
              description: "Choose your active connection (Wi-Fi or Ethernet) and open the Advanced options.",
            },
            {
              title: "Update DNS tab",
              description: "Add the WequiGuard DNS addresses in the DNS tab, then press OK.",
              callouts: [
                { label: "Primary DNS", value: dnsServers.primary },
                { label: "Secondary DNS", value: dnsServers.secondary },
              ],
            },
            {
              title: "Apply changes",
              description: "Click Apply to confirm. Your Mac's traffic is now filtered by WequiGuard.",
            },
          ],
        },
      ],
    },
    {
      id: "mobile",
      name: "Mobile",
      icon: "smartphone",
      description: "Protect iOS and Android devices individually.",
      sections: [
        {
          heading: "iOS / iPadOS",
          steps: [
            { title: "Open Wi-Fi settings", description: "Settings → Wi-Fi, then tap the (i) icon next to your network." },
            { title: "Configure DNS manually", description: "Tap Configure DNS → Manual and remove old servers." },
            {
              title: "Add WequiGuard DNS",
              description: "Add both DNS addresses below, then tap Save.",
              callouts: [
                { label: "DNS 1", value: dnsServers.primary },
                { label: "DNS 2", value: dnsServers.secondary },
              ],
            },
          ],
        },
        {
          heading: "Android",
          steps: [
            { title: "Open Wi-Fi settings", description: "Settings → Network & Internet → Internet, then tap your active network." },
            { title: "Edit advanced options", description: "Choose Advanced settings and switch IP settings to Static." },
            {
              title: "Enter DNS addresses",
              description: "Fill DNS 1 and DNS 2 with the WequiGuard values and save.",
              callouts: [
                { label: "DNS 1", value: dnsServers.primary },
                { label: "DNS 2", value: dnsServers.secondary },
              ],
            },
          ],
        },
      ],
    },
  ],
  troubleshooting: [
    {
      title: "Settings didn't save?",
      description: "Ensure you confirmed the changes (Save or Apply) and restart the device or router if needed.",
    },
    {
      title: "Internet feels slow?",
      description: "DNS changes rarely impact speed. Try flushing the DNS cache or rebooting the router.",
    },
    {
      title: "How do I verify it's working?",
      description: "Visit a test site with blocked content—WequiGuard should immediately prevent access.",
    },
  ],
};

export const faqContent: FaqContent = {
  faqs: [
    {
      question: "Is WequiGuard really free?",
      answer:
        "Yes. WequiGuard is completely free to use with no hidden fees or premium tiers—we believe online safety should be universal.",
    },
    {
      question: "How does WequiGuard work?",
      answer:
        "WequiGuard uses DNS filtering. Every domain request is checked against our safety database; harmful categories are blocked before a page loads.",
    },
    {
      question: "Will it slow down my internet?",
      answer:
        "DNS resolution happens in milliseconds. Most households see no slowdown, and some experience faster browsing because malicious hosts are blocked early.",
    },
    {
      question: "Can I whitelist or blacklist specific websites?",
      answer:
        "We currently focus on curated category protection for simplicity, but customizable allow/deny lists are on the roadmap.",
    },
    {
      question: "Do you log my browsing data?",
      answer:
        "No. We do not log DNS queries or sell user data. Privacy is a default stance, not an afterthought.",
    },
    {
      question: "What if I need help with the setup?",
      answer:
        "Use the guided Setup page for routers and devices. For additional help, contact support and we'll walk you through it.",
    },
    {
      question: "Does it work on all devices?",
      answer:
        "Yes. Router-level setup covers phones, laptops, TVs, consoles, and smart home devices automatically.",
    },
    {
      question: "What categories of content are blocked?",
      answer:
        "Adult content, gambling, malware, phishing, violent and extremist material, and more. SafeSearch is enforced on major search engines.",
    },
    {
      question: "Can I use WequiGuard at work or school?",
      answer:
        "Yes, if you control DNS settings. Always coordinate with IT administrators before changing managed networks.",
    },
    {
      question: "Is WequiGuard better than parental control software?",
      answer:
        "Each tool solves different problems. Many families pair network-level DNS filtering with per-device parental controls for layered safety.",
    },
  ],
  contactEmail: "support@wequiguard.com",
};

export const adminDashboardData: AdminDashboardData = {
  overview: {
    kpis: [
      { label: "QPS (10m)", value: "8.3k", helper: "Peak 9.1k" },
      { label: "Success %", value: "98.9%", trend: "+0.6%" },
      { label: "Block %", value: "21.2%", trend: "content" },
      { label: "Rewrite %", value: "3.4%", helper: "SafeSearch" },
      { label: "Error %", value: "0.12%", helper: "SERVFAIL/NXDOMAIN" },
    ],
    latency: { p50: 18, p95: 42, p99: 87, window: "Last 10 min" },
    cacheHitRatio: { tenMinutes: 82, oneHour: 79 },
    handshake: { successRate: 99.2, window: "10m" },
    tls: { domain: "guard.wequitech.com", daysRemaining: 42, expiresOn: "2025-05-02T00:00:00Z", status: "ok" },
    charts: {
      qpsVsError: Array.from({ length: 12 }).map((_, index) => {
        const timestamp = new Date(Date.now() - (11 - index) * 5 * 60 * 1000).toISOString();
        return {
          timestamp,
          qps: 6200 + index * 180,
          errorPercent: 0.08 + (index % 3) * 0.02,
        };
      }),
      latencyP95: Array.from({ length: 12 }).map((_, index) => ({
        timestamp: new Date(Date.now() - (11 - index) * 5 * 60 * 1000).toISOString(),
        p95: 35 + (index % 4) * 4,
      })),
      trafficSplit: [
        { label: "Allow", value: 68, color: "hsl(var(--primary))" },
        { label: "Block", value: 25, color: "hsl(var(--destructive))" },
        { label: "Rewrite", value: 7, color: "hsl(var(--secondary))" },
      ],
    },
    healthBadges: [
      { title: "Upstreams", status: "healthy", description: "4/4 responsive" },
      { title: "DB / Queue", status: "healthy", description: "QueryBatcher clear" },
      { title: "Blocklist Sync", status: "degraded", description: "37m since last pull" },
    ],
    quickLinks: [
      { label: "Open Live Feed", description: "Filtered to errors", href: "/admin#live-feed" },
      { label: "Open Health", description: "Upstreams & TLS", href: "/admin#health" },
      { label: "Top Hot Domains", description: "Cache insights", href: "/admin#cache" },
    ],
    emptyState: "Waiting for traffic… Send test queries.",
  },
  liveFeed: {
    rows: [
      {
        id: "lf-1",
        timestamp: "2025-01-17T15:41:22Z",
        user: "Lena M.",
        device: "Lena-iPad",
        clientIp: "172.16.4.18",
        asn: "AS15169",
        proto: "DoT",
        qname: "safe-search.google.com",
        qtype: "A",
        action: "rewrite",
        upstream: "cache",
        latencyMs: 22,
        rcode: "NOERROR",
      },
      {
        id: "lf-2",
        timestamp: "2025-01-17T15:41:18Z",
        user: "Carlos R.",
        device: "Switch",
        clientIp: "10.20.1.5",
        asn: "AS13335",
        proto: "UDP",
        qname: "gaming-bets.io",
        qtype: "A",
        action: "block",
        upstream: "Quad9",
        latencyMs: 31,
        rcode: "NXDOMAIN",
      },
      {
        id: "lf-3",
        timestamp: "2025-01-17T15:41:11Z",
        user: "Priya K.",
        device: "Kids-TV",
        clientIp: "192.168.30.88",
        asn: "AS16509",
        proto: "TCP",
        qname: "api.netflix.com",
        qtype: "AAAA",
        action: "allow",
        upstream: "Cache",
        latencyMs: 18,
        rcode: "NOERROR",
      },
    ],
    filters: {
      timeRanges: ["Last 5m", "Last 10m", "Last 1h", "Custom"],
      actions: ["allow", "block", "rewrite", "error"],
      protocols: ["UDP", "TCP", "DoT"],
      rcodes: ["NOERROR", "NXDOMAIN", "SERVFAIL"],
    },
  },
  users: {
    items: [
      {
        id: "user-1",
        name: "Lena McConnell",
        email: "lena@wequi.family",
        devices: 5,
        policy: "Family-Strict",
        lastActivity: "2m ago",
        role: "Admin",
      },
      {
        id: "user-2",
        name: "Carlos Rivera",
        email: "carlos@wequi.family",
        devices: 3,
        policy: "Balanced",
        lastActivity: "14m ago",
        role: "Analyst",
      },
      {
        id: "user-3",
        name: "Priya Kapoor",
        email: "priya@wequi.family",
        devices: 4,
        policy: "Homework",
        lastActivity: "1h ago",
        role: "Analyst",
      },
    ],
    roles: ["Admin", "Analyst"],
    lastActivityFilters: ["Active <5m", "Active <1h", "Dormant"],
  },
  devices: {
    items: [
      {
        id: "device-1",
        name: "Lena-iPad",
        platform: "iOS",
        hostname: "lena-2f3.guard.sni",
        lastSeen: "2025-01-17T15:40:30Z",
        ip: "172.16.4.18",
        asn: "AS15169",
        policy: "Family-Strict",
        status: "Online",
      },
      {
        id: "device-2",
        name: "Switch",
        platform: "Other",
        hostname: "switch-09.guard.sni",
        lastSeen: "2025-01-17T15:38:05Z",
        ip: "10.20.1.5",
        asn: "AS13335",
        policy: "Gaming",
        status: "Paused",
      },
      {
        id: "device-3",
        name: "Kids-TV",
        platform: "Android",
        hostname: "kids-tv.guard.sni",
        lastSeen: "2025-01-17T15:35:10Z",
        ip: "192.168.30.88",
        asn: "AS16509",
        policy: "Homework",
        status: "Online",
      },
    ],
    platforms: ["Android", "iOS", "Other"],
    statuses: ["Online", "Paused"],
    policies: ["Family-Strict", "Balanced", "Homework", "Gaming"],
  },
  policies: {
    items: [
      {
        id: "policy-1",
        name: "Family-Strict",
        owner: "Lena McConnell",
        safeSearch: true,
        categories: ["Adult", "Gambling", "Malware"],
        devices: 11,
        updatedAt: "2025-01-16T13:24:00Z",
        updatedBy: "Lena McConnell",
      },
      {
        id: "policy-2",
        name: "Balanced",
        owner: "Carlos Rivera",
        safeSearch: true,
        categories: ["Adult", "Malware"],
        devices: 6,
        updatedAt: "2025-01-15T08:11:00Z",
        updatedBy: "Carlos Rivera",
      },
      {
        id: "policy-3",
        name: "Homework",
        owner: "Priya Kapoor",
        safeSearch: true,
        categories: ["Adult", "Social"],
        devices: 4,
        updatedAt: "2025-01-14T20:45:00Z",
        updatedBy: "Priya Kapoor",
      },
    ],
    categories: ["Ads", "Adult", "Gambling", "Malware", "Social"],
  },
  overrides: {
    items: [
      {
        id: "ov-1",
        domain: "mathgames.com",
        action: "allow",
        scope: "User",
        target: "Priya Kapoor",
        hits: 132,
        createdAt: "2025-01-10T11:00:00Z",
        createdBy: "Priya Kapoor",
        expiresAt: "2025-02-10T11:00:00Z",
      },
      {
        id: "ov-2",
        domain: "twitch.tv",
        action: "block",
        scope: "Device",
        target: "Switch",
        hits: 54,
        createdAt: "2025-01-12T09:20:00Z",
        createdBy: "Carlos Rivera",
      },
    ],
  },
  health: {
    upstreams: [
      {
        id: "up-1",
        name: "Google",
        status: "Healthy",
        successRate: 99.3,
        avgLatency: 21,
        p95Latency: 38,
        lastFailure: "2025-01-16T23:12:00Z - timeout",
        retriesToday: 3,
      },
      {
        id: "up-2",
        name: "Cloudflare",
        status: "Healthy",
        successRate: 99.1,
        avgLatency: 24,
        p95Latency: 41,
        retriesToday: 1,
      },
      {
        id: "up-3",
        name: "Quad9",
        status: "Unhealthy",
        successRate: 92.2,
        avgLatency: 47,
        p95Latency: 88,
        lastFailure: "2025-01-17T14:52:00Z - NXDOMAIN spikes",
        retriesToday: 12,
      },
      {
        id: "up-4",
        name: "Custom Edge",
        status: "Healthy",
        successRate: 98.4,
        avgLatency: 29,
        p95Latency: 54,
        retriesToday: 4,
      },
    ],
    tls: {
      commonName: "guard.wequitech.com",
      sans: ["guard.wequitech.com", "*.guard.wequitech.com"],
      notBefore: "2024-11-02T00:00:00Z",
      notAfter: "2025-05-02T00:00:00Z",
      daysRemaining: 42,
      chainOk: true,
      lastRenewal: "2024-11-02T00:02:00Z",
      nextRenewal: "2025-04-28T12:00:00Z",
      lastErrors: [
        { label: "Handshake", count: 2 },
        { label: "SNI mismatch", count: 0 },
        { label: "Cipher", count: 0 },
      ],
    },
    timeseries: Array.from({ length: 12 }).map((_, index) => ({
      timestamp: new Date(Date.now() - (11 - index) * 5 * 60 * 1000).toISOString(),
      successRate: 98 + (index % 3),
      p95Latency: 40 + (index % 4) * 3,
    })),
  },
  cache: {
    summary: {
      hitRatio10m: 82,
      hitRatio1h: 79,
      items: 284_000,
      evictionsPerMin: 36,
      negativeHits: 412,
    },
    hotDomains: [
      { domain: "googleapis.com", hits10m: 1240, hits1h: 8120, avgTtl: 210, lastHit: "15s ago" },
      { domain: "roblox.com", hits10m: 980, hits1h: 6400, avgTtl: 180, lastHit: "32s ago" },
      { domain: "youtube.com", hits10m: 860, hits1h: 5900, avgTtl: 90, lastHit: "5s ago" },
    ],
    latency: {
      cacheMs: 18,
      upstreamMs: 27,
      policyMs: 6,
    },
  },
};

export const staticContent = {
  home: homeContent,
  features: featureContent,
  setup: setupContent,
  faq: faqContent,
  admin: adminDashboardData,
};
