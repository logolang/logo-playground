import { Subject } from "rxjs/Rx";
import { injectable } from "app/di";
import { ISubscription } from "rxjs/Subscription";

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
  shareProgramToGist = "share.programToGist",
  openProgramFromSharedGist = "share.openFromGist",

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

export abstract class IEventsTrackingService {
  abstract sendEvent(eventAction: EventAction, data?: string): void;
  abstract subscribe(handler: EventHandler): void;
}

@injectable()
export class EventsTrackingService implements IEventsTrackingService {
  private eventsSubject = new Subject<IEventData>();
  private subscriptions: { handler: EventHandler; subscription: ISubscription }[] = [];

  sendEvent(eventAction: EventAction, data?: string): void {
    const [category, action] = eventAction.split(".");
    if (!category || !action) {
      throw new Error("Event action ID is not valid - should be in 'CATEGORY.ACTION' format");
    }
    this.eventsSubject.next({ category, action, data: data });
  }

  subscribe(handler: (eventData: IEventData) => void): void {
    this.subscriptions.push({
      handler: handler,
      subscription: this.eventsSubject.subscribe(handler)
    });
  }
}
