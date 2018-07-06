import { Subject, Observable } from "rxjs";

import { injectable } from "app/di";

type NotificationType = "danger" | "info" | "success" | "warning" | "primary";

interface INotification {
  title?: string | JSX.Element;
  message: string | JSX.Element;
  type?: NotificationType;
  closeTimeout?: number;
}

@injectable()
export class NotificationService {
  private notificationsSubject = new Subject<INotification>();

  push(notification: INotification): void {
    this.notificationsSubject.next(notification);
  }

  getObservable(): Observable<INotification> {
    return this.notificationsSubject.asObservable();
  }
}
