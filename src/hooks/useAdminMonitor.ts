import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminMonitorService } from "@/services/admin-monitor-service";
import type {
  CreateOverridePayload,
  MonitorWindow,
  QueryFeedFilters,
  UpdatePolicyPayload,
} from "@/types/admin";

const REFRESH = {
  overview: 10_000,
  liveFeed: 2_000,
  health: 30_000,
};

export const useMonitorOverview = (window: MonitorWindow) =>
  useQuery({
    queryKey: ["admin", "overview", window],
    queryFn: () => adminMonitorService.getOverview(window),
    refetchInterval: REFRESH.overview,
  });

export const useMonitorQueryFeed = (filters: QueryFeedFilters, options?: { enabled?: boolean; refetch?: boolean }) =>
  useQuery({
    queryKey: ["admin", "query-feed", filters],
    queryFn: () => adminMonitorService.getQueryFeed(filters),
    refetchInterval: options?.refetch === false ? undefined : REFRESH.liveFeed,
    keepPreviousData: true,
    enabled: options?.enabled ?? true,
  });

export const useExportQueryFeed = () =>
  useMutation({
    mutationFn: (filters: QueryFeedFilters) => adminMonitorService.exportQueryFeed(filters),
  });

export const useMonitorUsers = () =>
  useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => adminMonitorService.getUsers(),
    refetchOnWindowFocus: false,
  });

export const useMonitorPolicies = () =>
  useQuery({
    queryKey: ["admin", "policies"],
    queryFn: () => adminMonitorService.getPolicies(),
  });

export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ policyUserId, payload }: { policyUserId: string; payload: UpdatePolicyPayload }) =>
      adminMonitorService.updatePolicy(policyUserId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "policies"] });
    },
  });
};

export const useMonitorOverrides = (userId?: string) =>
  useQuery({
    queryKey: ["admin", "overrides", userId],
    queryFn: () => adminMonitorService.getOverrides(userId),
  });

export const useCreateOverride = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOverridePayload) => adminMonitorService.createOverride(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "overrides", variables.user_id] });
    },
  });
};

export const useDeleteOverride = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ overrideId, userId }: { overrideId: string; userId?: string }) =>
      adminMonitorService.deleteOverride(overrideId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "overrides", userId] });
    },
  });
};

export const useMonitorUpstreams = () =>
  useQuery({
    queryKey: ["admin", "upstreams"],
    queryFn: () => adminMonitorService.getUpstreams(),
    refetchInterval: REFRESH.health,
  });

export const useMonitorTlsStatus = () =>
  useQuery({
    queryKey: ["admin", "tls"],
    queryFn: () => adminMonitorService.getTlsStatus(),
    refetchInterval: REFRESH.health,
  });

export const useMonitorCacheMetrics = (window: MonitorWindow) =>
  useQuery({
    queryKey: ["admin", "cache", window],
    queryFn: () => adminMonitorService.getCacheMetrics(window),
  });

export const useMonitorAlerts = () =>
  useQuery({
    queryKey: ["admin", "alerts"],
    queryFn: () => adminMonitorService.getAlerts(),
    refetchInterval: REFRESH.health,
  });
