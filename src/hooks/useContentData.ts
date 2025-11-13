import { useQuery } from "@tanstack/react-query";

import { contentService } from "@/services/content-service";

const SHARED_QUERY_OPTIONS = {
  staleTime: Infinity,
  gcTime: 1000 * 60 * 5,
} as const;

export const useHomeContent = () =>
  useQuery({
    queryKey: ["content", "home"],
    queryFn: () => contentService.getHomeContent(),
    ...SHARED_QUERY_OPTIONS,
  });

export const useFeatureContent = () =>
  useQuery({
    queryKey: ["content", "features"],
    queryFn: () => contentService.getFeatureContent(),
    ...SHARED_QUERY_OPTIONS,
  });

export const useSetupContent = () =>
  useQuery({
    queryKey: ["content", "setup"],
    queryFn: () => contentService.getSetupContent(),
    ...SHARED_QUERY_OPTIONS,
  });

export const useFaqContent = () =>
  useQuery({
    queryKey: ["content", "faq"],
    queryFn: () => contentService.getFaqContent(),
    ...SHARED_QUERY_OPTIONS,
  });
