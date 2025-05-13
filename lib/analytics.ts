import mixpanel from "mixpanel-browser";

// Event Types
export type PageViewEvent = {
  pageName: string;
  url: string;
};

export type TabViewEvent = {
  symbol?: string;
};

// Analytics Service Class
class AnalyticsService {
  private static instance: AnalyticsService;
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    const mixpanelToken = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
    
    if (mixpanelToken) {
      try {
        mixpanel.init(mixpanelToken, {
          debug: false,
          track_pageview: false,
          persistence: "localStorage",
          api_host: "https://api-eu.mixpanel.com",
          ignore_dnt: true,
          batch_requests: false,
          verbose: false,
          disable_persistence: false,
          disable_cookie: true,
          secure_cookie: true,
          cross_site_cookie: false
        });
        
        this.isInitialized = true;
      } catch (error) {
        // Silently fail in production
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to initialize Mixpanel:', error);
        }
      }
    }
  }

  private isReady(): boolean {
    return typeof window !== 'undefined' && this.isInitialized;
  }

  public identifyUser(userId: string, traits?: Record<string, any>) {
    if (!this.isReady()) return;
    mixpanel.identify(userId);
    if (traits) {
      mixpanel.people.set(traits);
    }
  }

  public resetUser() {
    if (!this.isReady()) return;
    mixpanel.reset();
  }

  public trackPageView(event: PageViewEvent) {
    if (!this.isReady()) return;
    mixpanel.track('Page Viewed', event);
  }

  public trackSummaryTabView(event: TabViewEvent) {
    if (!this.isReady()) return;
    mixpanel.track('Summary Tab Viewed', event);
  }

  public trackQATabView(event: TabViewEvent) {
    if (!this.isReady()) return;
    mixpanel.track('Q&A Tab Viewed', event);
  }

  public trackGuidanceTabView(event: TabViewEvent) {
    if (!this.isReady()) return;
    mixpanel.track('Guidance Tab Viewed', event);
  }

  public trackCustomTabView(event: TabViewEvent & { tabName: string }) {
    if (!this.isReady()) return;
    mixpanel.track('Custom Tab Viewed', event);
  }
}

export const analytics = AnalyticsService.getInstance(); 