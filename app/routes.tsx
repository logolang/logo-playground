import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, hashHistory, Redirect } from 'react-router'
import { inject, RouteInfo } from 'app/utils/route-info';

import { MainComponent } from 'app/ui/main.component'
import { ProxyComponent } from 'app/ui/shared/generic/proxy.component'
import { DashboardComponent } from 'app/ui/dashboard.component';
import { UserProfileComponent } from 'app/ui/user-profile.component';
import { ErrorComponent } from 'app/ui/error.component';
import { AboutComponent } from 'app/ui/about.component';
import { DocumentationComponent } from 'app/ui/documentation.component';
import { TutorialsComponent, ITutorialPageRouteParams } from 'app/ui/tutorials-page/tutorials.component';
import { PlaygroundPageComponent } from 'app/ui/playground-page/playground-page.component';
import { StubComponent } from 'app/ui/stub.component';

export class Routes {
    static getRouteDefinitions(): JSX.Element {
        return <Router history={hashHistory} >
            <Redirect from="/" to={Routes.galleryRoot.relativePath} />
            <Route path="/" component={MainComponent} >
                <Route path={Routes.galleryRoot.relativePath} component={ProxyComponent}>
                    <IndexRoute component={DashboardComponent}></IndexRoute>
                </Route>

                <Route path={Routes.aboutRoot.relativePath} component={ProxyComponent}>
                    <IndexRoute component={AboutComponent}></IndexRoute>
                </Route>

                <Route path={Routes.playgroundRoot.relativePath} component={ProxyComponent}>
                    <Route path={Routes.playgroundLoadSample.relativePath} component={PlaygroundPageComponent}></Route>
                    <Route path={Routes.playgroundLoadFromLibrary.relativePath} component={PlaygroundPageComponent}></Route>
                    <Route path={Routes.playgroundLoadFromGist.relativePath} component={PlaygroundPageComponent}></Route>
                    <IndexRoute component={PlaygroundPageComponent}></IndexRoute>
                </Route>

                <Route path={Routes.documentationRoot.relativePath} component={ProxyComponent}>
                    <IndexRoute component={DocumentationComponent}></IndexRoute>
                </Route>

                <Route path={Routes.tutorialsRoot.relativePath} component={ProxyComponent}>
                    <Route path={Routes.tutorialSpecified.relativePath} component={TutorialsComponent}></Route>
                    <IndexRoute component={TutorialsComponent}></IndexRoute>
                </Route>

                <Route path={Routes.settingsRoot.relativePath} component={UserProfileComponent}></Route>

                {/* Default route will be used in case of nothing matches */}
                <Route path="*" component={DashboardComponent} />
            </Route>
        </Router >
    }

    static readonly appRoot = "/";
    static readonly galleryRoot = RouteInfo.root("gallery");
    static readonly settingsRoot = RouteInfo.root("settings");
    static readonly aboutRoot = RouteInfo.root("about");

    static readonly playgroundRoot = RouteInfo.root("code");
    static readonly playgroundLoadSample = RouteInfo.childWithParams<{ sampleId: string }>(
        Routes.playgroundRoot, "samples/:sampleId");
    static readonly playgroundLoadFromLibrary = RouteInfo.childWithParams<{ programId: string }>(
        Routes.playgroundRoot, "library/:programId");
    static readonly playgroundLoadFromGist = RouteInfo.childWithParams<{ gistId: string }>(
        Routes.playgroundRoot, "gist/:gistId");

    static readonly documentationRoot = RouteInfo.root("doc");
    static readonly tutorialsRoot = RouteInfo.root("tutorials");
    static readonly tutorialSpecified = RouteInfo.childWithParams<ITutorialPageRouteParams>(
        Routes.tutorialsRoot, ":tutorialId/:stepIndex");
}
