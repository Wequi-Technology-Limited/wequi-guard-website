import { staticContent } from "@/data/static-content";
import type {
  AdminDashboardData,
  FaqContent,
  FeatureContent,
  HomeContent,
  SetupContent,
} from "@/types/content";

const clone = <T>(payload: T): T => JSON.parse(JSON.stringify(payload));

export interface ContentDataSource {
  getHomeContent(): Promise<HomeContent>;
  getFeatureContent(): Promise<FeatureContent>;
  getSetupContent(): Promise<SetupContent>;
  getFaqContent(): Promise<FaqContent>;
  getAdminDashboard(): Promise<AdminDashboardData>;
}

const staticDataSource: ContentDataSource = {
  getHomeContent: async () => clone(staticContent.home),
  getFeatureContent: async () => clone(staticContent.features),
  getSetupContent: async () => clone(staticContent.setup),
  getFaqContent: async () => clone(staticContent.faq),
  getAdminDashboard: async () => clone(staticContent.admin),
};

class ContentService {
  private dataSource: ContentDataSource;

  constructor(dataSource: ContentDataSource = staticDataSource) {
    this.dataSource = dataSource;
  }

  use(dataSource: ContentDataSource) {
    this.dataSource = dataSource;
  }

  getHomeContent() {
    return this.dataSource.getHomeContent();
  }

  getFeatureContent() {
    return this.dataSource.getFeatureContent();
  }

  getSetupContent() {
    return this.dataSource.getSetupContent();
  }

  getFaqContent() {
    return this.dataSource.getFaqContent();
  }

  getAdminDashboard() {
    return this.dataSource.getAdminDashboard();
  }
}

export const contentService = new ContentService();

export const registerContentDataSource = (dataSource: ContentDataSource) => {
  contentService.use(dataSource);
};
