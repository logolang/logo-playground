interface IEventData {
  category: string;
  action: string;
  data?: string;
}

export class GoogleAnalyticsTrackerService {
  trackEvent(event: IEventData): void {
    setTimeout(() => {
      const ga = (window as any).ga;
      if (ga) {
        const tracker = ga.getAll()[0];
        tracker.send("event", {
          eventCategory: event.category,
          eventAction: event.action,
          eventLabel: event.data
        });
      }
    }, 0);
  }
}
