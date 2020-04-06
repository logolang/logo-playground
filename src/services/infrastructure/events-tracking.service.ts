export enum EventAction {
  userLogin = "actions.login",
  userLogout = "actions.logout",

  tutorialsNavigation = "actions.tutorialsNavigation",
  tutorialsFixTheCode = "actions.tutorialsFixTheCode",

  shareScreenshot = "actions.shareScreenshot",
  shareProgram = "actions.shareProgram",
  saveProgramToPersonalLibrary = "actions.saveProgram",
  revertProgramChanges = "actions.revertProgram",

  openPlayground = "navigation.openPlayground",
  openProgramFromLibrary = "navigation.openProgramFromLibrary",
  openProgramFromSample = "navigation.openProgramFromSample",
  openProgramFromShare = "navigation.openProgramFromShare",
  openGallery = "navigation.openGallery",
  openSettings = "navigation.openSettings",
  openAbout = "navigation.openAbout",
  openCheatsheet = "navigation.openCheatsheet",
  openTutorials = "navigation.openTutorials"
}

interface EventData {
  category: string;
  action: string;
  data?: string;
}

type EventHandler = (eventData: EventData) => void;

export class EventsTrackingService {
  private trackers: EventHandler[] = [];

  sendEvent(eventAction: EventAction, data?: string): void {
    const [category, action] = eventAction.split(".");
    if (!category || !action) {
      throw new Error("Event action ID is not valid - should be in 'CATEGORY.ACTION' format");
    }
    for (const tracker of this.trackers) {
      tracker({ category, action, data: data });
    }
  }

  addTracker(trackFn: (eventData: EventData) => void): void {
    this.trackers.push(trackFn);
  }
}
