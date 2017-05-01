export class RouteInfo<TParams>{
    private parent?: RouteInfo<never>
    private path: string

    constructor(parent: RouteInfo<any> | undefined, path: string) {
        this.parent = parent;
        this.path = path;
    }

    get relativePath(): string {
        if (this.parent) {
            const parentRelativePath = this.parent.relativePath;
            if (parentRelativePath != '/') {
                return this.parent.relativePath + this.path;
            }
        }
        return this.path;
    }

    build(params: TParams): string {
        let result = this.relativePath;
        for (const key in params) {
            if (params.hasOwnProperty(key)) {
                result = result.replace(':' + key, encodeURIComponent((params as any)[key]));
            }
        }
        return result;
    }
}
