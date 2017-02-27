export function inject(routeDef: string, params: any): string {
    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            routeDef = routeDef.replace(':' + key, params[key]);
        }
    }
    return routeDef;
}

export class RouteInfo<TParams>{
    parent?: RouteInfo<never>
    relativePath: string

    static root(path: string): RouteInfo<never> {
        let routeInfo = new RouteInfo<never>();
        routeInfo.relativePath = path;
        return routeInfo;
    }

    static child(parent: RouteInfo<never>, path: string): RouteInfo<never> {
        let routeInfo = new RouteInfo<never>();
        routeInfo.parent = parent;
        routeInfo.relativePath = path;
        return routeInfo;
    }

    static childWithParams<TParams>(parent: RouteInfo<any>, path: string): RouteInfo<TParams> {
        let routeInfo = new RouteInfo<TParams>();
        routeInfo.parent = parent;
        routeInfo.relativePath = path;
        return routeInfo;
    }

    build(): string {
        if (this.parent) {
            return this.parent.build() + "/" + this.relativePath;
        }
        return this.relativePath;
    }

    buildWithParams(params: TParams): string {
        const fullPath = this.build();
        if (params) {
            return inject(fullPath, params);
        }
        return fullPath;
    }
}
