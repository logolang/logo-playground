import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, hashHistory, Redirect } from 'react-router'
import { inject, RouteInfo } from 'app/utils/route-info';

import { MainComponent } from 'app/ui/main.component'
import { ProxyComponent } from 'app/ui/_generic/proxy.component'
import { GalleryComponent } from 'app/ui/gallery.component';
import { UserProfileComponent } from 'app/ui/user-profile.component';
import { ErrorComponent } from 'app/ui/error.component';
import { AboutComponent } from 'app/ui/about.component';
import { DocumentationComponent } from 'app/ui/documentation.component';
import { TutorialsComponent, ITutorialPageRouteParams } from 'app/ui/tutorials/tutorials.component';
import { PlaygroundPageComponent } from 'app/ui/playground/playground-page.component';

export class Routes {
    static getRouteDefinitions(): JSX.Element {
        return <Router history={hashHistory} >
            <Redirect from="/" to={Routes.galleryRoot.relativePath} />
            <Route path="/" component={MainComponent} >
                <Route path={Routes.galleryRoot.relativePath} component={ProxyComponent}>
                    <IndexRoute component={GalleryComponent}></IndexRoute>
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
                <Route path="*" component={GalleryComponent} />
            </Route>
        </Router >
    }

    static readonly appRoot = "/";
    static readonly galleryRoot = new RouteInfo(null, "gallery");
    static readonly settingsRoot = new RouteInfo(null, "settings");
    static readonly aboutRoot = new RouteInfo(null, "about");

    static readonly playgroundRoot = new RouteInfo(null, "code");
    static readonly playgroundLoadSample = new RouteInfo<{ sampleId: string }>(
        Routes.playgroundRoot, "samples/:sampleId");
    static readonly playgroundLoadFromLibrary = new RouteInfo<{ programId: string }>(
        Routes.playgroundRoot, "library/:programId");
    static readonly playgroundLoadFromGist = new RouteInfo<{ gistId: string }>(
        Routes.playgroundRoot, "gist/:gistId");

    static readonly documentationRoot = new RouteInfo(null, "doc");
    static readonly tutorialsRoot = new RouteInfo(null, "tutorials");
    static readonly tutorialSpecified = new RouteInfo<ITutorialPageRouteParams>(
        Routes.tutorialsRoot, ":tutorialId/:stepIndex");
}
