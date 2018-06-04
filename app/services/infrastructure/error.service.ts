import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";

import { injectable } from "app/di";
import { ErrorDef } from "app/utils/error-helpers";

@injectable()
export class ErrorService {
  private errors = new Subject<ErrorDef>();

  public handleError = (err: ErrorDef) => {
    this.errors.next(err);
  };

  public getObservable(): Observable<ErrorDef> {
    return this.errors.asObservable();
  }
}