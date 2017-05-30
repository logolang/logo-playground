import { Observable, Subject, Subscription } from 'rxjs/Rx';
import { injectable } from "app/di";

interface INavigationRequest {
    route: string
}

export abstract class INavigationService {
    abstract navigate(request: INavigationRequest): void
    abstract getObservable(): Observable<INavigationRequest>
}

@injectable()
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