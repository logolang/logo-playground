import { Observable, Subject } from "rxjs/Rx";
import { injectable } from "app/di";

type NotificationType = "danger" | "info" | "success" | "warning" | "primary";

interface INotification {
  title?: string | JSX.Element;
  message: string | JSX.Element;
  type?: NotificationType;
  closeTimeout?: number;
}

export abstract class INotificationService {
  abstract push(notification: INotification): void;
  abstract getObservable(): Observable<INotification>;
}

@injectable()
export class NotificationService implements INotificationService {
  private notificationsSubject = new Subject<INotification>();

  push(notification: INotification): void {
    this.notificationsSubject.next(notification);
  }

  getObservable(): Observable<INotification> {
    return this.notificationsSubject;
  }
}
