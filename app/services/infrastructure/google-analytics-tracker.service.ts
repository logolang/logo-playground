interface IEventData {
  category: string;
  action: string;
  data?: string;
}

export class GoogleAnalyticsTrackerService {
  trackEvent(event: IEventData): void {
    const ga: any = (window as any)["ga"];
    if (ga) {
      setTimeout(() => {
        ga("send", "event", {
          eventCategory: event.category,
          eventAction: event.action,
          eventLabel: event.data
        });
      }, 0);
    }
  }
}
