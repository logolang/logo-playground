export class RouteInfo<TParams> {
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
      if (params.hasOwnProperty(key)) {
        result = result.replace(":" + key, encodeURIComponent((params as any)[key]));
      }
    }
    return result;
  }
}
