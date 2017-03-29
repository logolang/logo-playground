import { Observable, Subject, Subscription } from 'rxjs/Rx';

type NotificationType = "danger" | "info" | "success" | "warning"

interface INotification {
    title?: string | JSX.Element
    message: string | JSX.Element
    type?: NotificationType
    closeTimeout?: number
}

export interface INotificationService {
    push(notification: INotification): void
    getObservable(): Observable<INotification>
}

export class NotificationService implements INotificationService {
    private notificationsSubject = new Subject<INotification>();

    constructor() {
    }

    push(notification: INotification): void {
        this.notificationsSubject.next(notification);
    }

    getObservable(): Observable<INotification> {
        return this.notificationsSubject;
    }
}