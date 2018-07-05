import { Subject, Observable } from "rxjs";

import { injectable } from "app/di";

interface INavigationRequest {
  route: string;
}

@injectable()
export class NavigationService {
  private subject = new Subject<INavigationRequest>();

  navigate(request: INavigationRequest): void {
    this.subject.next(request);
  }

  getObservable(): Observable<INavigationRequest> {
    return this.subject.asObservable();
  }
}
