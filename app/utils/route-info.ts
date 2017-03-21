export function inject(routeDef: string, params: any): string {
    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            routeDef = routeDef.replace(':' + key, encodeURIComponent(params[key]));
        }
    }
    return routeDef;
}

export class RouteInfo<TParams>{
    parent?: RouteInfo<never>
    relativePath: string

    constructor(parent: RouteInfo<any> | undefined | null, path: string) {
        this.parent = parent || undefined;
        this.relativePath = path;
    }

    private buildWithoutInject(): string {
        if (this.parent) {
            return this.parent.buildWithoutInject() + "/" + this.relativePath;
        }
        return this.relativePath;
    }

    build(params: TParams): string {
        const fullPath = this.buildWithoutInject();
        if (params) {
            return inject(fullPath, params);
        }
        return fullPath;
    }
}
