interface EventData {
  category: string;
  action: string;
  data?: string;
}

// Google analytics global variable
declare const ga:
  | {
      getAll(): {
        send(event: string, options: { [key: string]: string | undefined }): void;
      }[];
    }
  | undefined;

export class GoogleAnalyticsTracker {
  trackEvent = (event: EventData): void => {
    setTimeout(() => {
      if (ga) {
        const tracker = ga.getAll()[0];
        tracker.send("event", {
          eventCategory: event.category,
          eventAction: event.action,
          eventLabel: event.data
        });
      }
    }, 0);
  };
}
