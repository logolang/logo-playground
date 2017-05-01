import { Observable, Subject, Subscription } from 'rxjs/Rx';

interface INavigationRequest {
    route: string
}

export interface INavigationService {
    navigate(request: INavigationRequest): void
    getObservable(): Observable<INavigationRequest>
}

export class NavigationService implements INavigationService {
    private subject = new Subject<INavigationRequest>();

    constructor() {
    }

    navigate(request: INavigationRequest): void {
        this.subject.next(request);
    }

    getObservable(): Observable<INavigationRequest> {
        return this.subject;
    }
}