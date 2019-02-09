export enum EventAction {
  userLogin = "user.login",
  userLogout = "user.logout",

  programStart = "program.start",
  programStop = "program.stop",
  programResetChanges = "program.resetChanges",

  tutorialsOpen = "tutorials.open",
  tutorialsStart = "tutorials.start",
  tutorialsNext = "tutorials.next",
  tutorialsBack = "tutorials.back",
  tutorialsFixTheCode = "tutorials.fixTheCode",

  shareScreenshot = "share.screenshot",
  shareProgram = "share.program_share",
  openSharedProgram = "share.program_open",

  openProgramFromPersonalLibrary = "personalLibrary.openProgram",
  saveProgramToPersonalLibrary = "personalLibrary.saveProgram",
  deleteProgramFromPersonalLibrary = "personalLibrary.deleteProgram",

  openPlayground = "navigation.openPlayground",
  openGallery = "navigation.openGallery",
  openSettings = "navigation.openSettings",
  openAbout = "navigation.openAbout",
  openCheatsheet = "navigation.openCheatsheet"
}

interface IEventData {
  category: string;
  action: string;
  data?: string;
}

type EventHandler = (eventData: IEventData) => void;

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

  addTracker(trackFn: (eventData: IEventData) => void): void {
    this.trackers.push(trackFn);
  }
}
