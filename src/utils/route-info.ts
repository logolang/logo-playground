export class RouteInfo<TParams extends { [key: string]: string | number | boolean }> {
  private _path: string;

  constructor(path: string) {
    this._path = path;
  }

  get path(): string {
    return this._path;
  }

  build(params: TParams): string {
    let result = this._path;
    for (const key in params) {
      result = result.replace(":" + key, encodeURIComponent(params[key]));
    }
    return result;
  }
}
