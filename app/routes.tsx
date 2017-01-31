import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, hashHistory, Redirect } from 'react-router'

import { MainComponent } from 'app/ui/main.component'
import { ProxyComponent } from 'app/ui/shared/generic/proxy.component'
import { DashboardComponent } from 'app/ui/dashboard.component';
import { UserProfileComponent } from 'app/ui/user-profile.component';
import { ErrorComponent } from 'app/ui/error.component';
import { AboutComponent } from 'app/ui/about.component';
import { EditorPageComponent } from 'app/ui/editor-page/editor-page.component';
import { StubComponent } from 'app/ui/stub.component';

export class Routes {
    static getRouteDefinitions(): JSX.Element {
        return <Router history={hashHistory} >
            <Redirect from="/" to="dashboard" />
            <Route path="/" component={MainComponent} >
                <Route path='dashboard' component={ProxyComponent}>
                    <IndexRoute component={DashboardComponent}></IndexRoute>
                </Route>

                <Route path='page1' component={ProxyComponent}>
                    <IndexRoute component={StubComponent}></IndexRoute>
                </Route>

                <Route path='about' component={ProxyComponent}>
                    <IndexRoute component={AboutComponent}></IndexRoute>
                </Route>

                <Route path='code' component={ProxyComponent}>
                    <IndexRoute component={EditorPageComponent}></IndexRoute>
                </Route>

                <Route path={Routes.userProfile} component={UserProfileComponent}></Route>

                {/* Default route will be used in case of nothing matches */}
                <Route path="*" component={DashboardComponent} />
            </Route>
        </Router >
    }

    static readonly appRoot = "/";
    static readonly dashboardsRoot = "dashboard";
    static readonly page1Root = "/page1";
    static readonly userProfile = "/userprofile";
    static readonly about = "/about";
    static readonly editorPageRoot = "/code";
}

interface Map {
    [key: string]: string;
}

function inject(routeDef: string, params: Map): string {
    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            routeDef = routeDef.replace(':' + key, params[key]);
        }
    }
    return routeDef;
}