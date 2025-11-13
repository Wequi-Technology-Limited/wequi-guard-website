import type { LucideIcon } from "lucide-react";
import {
  Award,
  CheckCircle,
  DollarSign,
  Laptop,
  Lock,
  Router,
  Search,
  Settings,
  Shield,
  ShieldBan,
  ShieldCheck,
  Smartphone,
  Users,
  Zap,
} from "lucide-react";

const iconMap = {
  shield: Shield,
  settings: Settings,
  checkCircle: CheckCircle,
  award: Award,
  users: Users,
  zap: Zap,
  shieldBan: ShieldBan,
  search: Search,
  shieldCheck: ShieldCheck,
  lock: Lock,
  laptop: Laptop,
  dollarSign: DollarSign,
  router: Router,
  smartphone: Smartphone,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof iconMap;

export const getIconByName = (name: IconName): LucideIcon => iconMap[name];

export const iconNames = Object.keys(iconMap) as IconName[];
