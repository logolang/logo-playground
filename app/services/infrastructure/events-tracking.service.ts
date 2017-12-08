import { Observable, Subject } from "rxjs/Rx";
import { injectable } from "app/di";
import { ISubscription } from "rxjs/Subscription";

export enum EventCategory {
  program = "program",
  user = "user",
  tutorials = "tutorials",
  personalLibrary = "personalLibrary",
  gist = "gist",
  other = "other"
}

export enum EventAction {
  // userLogin = "userLogin",
  // userLogout = "userLogout",
  // userOpenSettings = "userOpenSettings",
  // userOpenAbout = "userOpenAbout",
  // userOpenCheatsheet = "userOpenCheatsheet",

  tutorialsOpen = "tutorialsOpen",
  tutorialsStart = "tutorialsStart",
  tutorialsNext = "tutorialsNext",
  tutorialsBack = "tutorialsBack",
  tutorialsFixTheCode = "tutorialsFixTheCode",

  // playgroundOpen = "playgroundOpen",

  programStart = "programStart",
  programStop = "programStop",
  // programUndo = "programUndo",

  screenshotShare = "screenshotShare",

  galleryProgramOpen = "galleryProgramOpen",

  // personalLibraryOpen = "personalLibraryOpen",
  // personalLibrarySave = "personalLibrarySave",
  // personalLibraryDelete = "personalLibraryDelete",

  gistProgramOpen = "gistProgramOpen",
  gistProgramShare = "gistProgramShare"
}

interface IEventData {
  category: EventCategory;
  action: EventAction;
  data?: string;
}

type EventHandler = (eventData: IEventData) => void;

export abstract class IEventsTrackingService {
  abstract sendEvent(event: IEventData): void;
  abstract subscribe(handler: EventHandler): void;
}

@injectable()
export class EventsTrackingService implements IEventsTrackingService {
  private eventsSubject = new Subject<IEventData>();
  private subscriptions: { handler: EventHandler; subscription: ISubscription }[] = [];

  sendEvent(event: IEventData): void {
    this.eventsSubject.next(event);
  }

  subscribe(handler: (eventData: IEventData) => void): void {
    this.subscriptions.push({
      handler: handler,
      subscription: this.eventsSubject.subscribe(handler)
    });
  }
}
