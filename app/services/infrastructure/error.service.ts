import { Subject, Observable } from "rxjs";

import { ErrorDef } from "app/utils/error-helpers";

export class ErrorService {
  private errors = new Subject<ErrorDef>();

  public handleError = (err: ErrorDef) => {
    this.errors.next(err);
  };

  public getObservable(): Observable<ErrorDef> {
    return this.errors.asObservable();
  }
}
