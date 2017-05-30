import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { HashRouter as Router, Route, Switch, Redirect, RouteProps, RouteComponentProps, withRouter } from "react-router-dom";
import { RouteInfo } from 'app/utils/route-info';

import { UserProfileComponent } from 'app/ui/user-profile.component';
import { MessageTosterComponent } from "app/ui/_generic/message-toster.component";
import { AboutComponent } from "app/ui/about.component";
import { TutorialsComponent, ITutorialPageRouteParams } from "app/ui/tutorials/tutorials.component";
import { GalleryComponent } from "app/ui/gallery.component";
import { PlaygroundPageComponent } from "app/ui/playground/playground-page.component";
import { DocumentationComponent } from "app/ui/documentation.component";
import { LoginComponent } from "app/ui/login.component";
import { lazyInject } from "app/di";
import { INavigationService } from "app/services/infrastructure/navigation.service";
import { INotificationService } from "app/services/infrastructure/notification.service";

export class Routes extends React.Component<object, object> {
    @lazyInject(INavigationService)
    private navigationService: INavigationService;

    @lazyInject(INotificationService)
    private notificationService: INotificationService;

    private router: any;

    componentDidMount() {
        // Initialize navigation service to perform navigation via React Router
        this.navigationService.getObservable().subscribe(request => {
            this.router.history.push(request.route);
        })
    }

    render(): JSX.Element {
        return <Router ref={router => this.router = router}>
            <div>
                <MessageTosterComponent events={this.notificationService.getObservable()} />
                <Switch>
                    <Route path={Routes.loginRoot.relativePath} component={LoginComponent} />

                    <Route path={Routes.galleryRoot.relativePath} component={GalleryComponent} />

                    <Route path={Routes.settingsRoot.relativePath} component={UserProfileComponent} />

                    <Route path={Routes.aboutRoot.relativePath} component={AboutComponent} />

                    <Route exact path={Routes.playgroundRoot.relativePath} component={PlaygroundPageComponent}></Route>
                    <Route exact path={Routes.playgroundLoadSample.relativePath} component={PlaygroundPageComponent}></Route>
                    <Route exact path={Routes.playgroundLoadFromLibrary.relativePath} component={PlaygroundPageComponent}></Route>
                    <Route exact path={Routes.playgroundLoadFromGist.relativePath} component={PlaygroundPageComponent}></Route>

                    <Route path={Routes.documentationRoot.relativePath} component={DocumentationComponent} />

                    <Route exact path={Routes.tutorialsRoot.relativePath} component={TutorialsComponent} />
                    <Route exact path={Routes.tutorialSpecified.relativePath} component={TutorialsComponent} />

                    <Redirect from="/" to={Routes.galleryRoot.relativePath} />

                    {/* Default route will be used in case if nothing matches */}
                    <Route component={GalleryComponent} />
                </Switch>
            </div>
        </Router>
    }

    static readonly root = new RouteInfo(undefined, "/");

    static readonly loginRoot = new RouteInfo(Routes.root, "/login");

    static readonly aboutRoot = new RouteInfo(Routes.root, "/about");
    static readonly settingsRoot = new RouteInfo(Routes.root, "/settings");

    static readonly galleryRoot = new RouteInfo(Routes.root, "/gallery");

    static readonly playgroundRoot = new RouteInfo(Routes.root, "/code");
    static readonly playgroundLoadSample = new RouteInfo<{ sampleId: string }>(Routes.playgroundRoot, "/samples/:sampleId");
    static readonly playgroundLoadFromLibrary = new RouteInfo<{ programId: string }>(Routes.playgroundRoot, "/library/:programId");
    static readonly playgroundLoadFromGist = new RouteInfo<{ gistId: string }>(Routes.playgroundRoot, "/gist/:gistId");

    static readonly documentationRoot = new RouteInfo(Routes.root, "/doc");

    static readonly tutorialsRoot = new RouteInfo(Routes.root, "/tutorials");
    static readonly tutorialSpecified = new RouteInfo<ITutorialPageRouteParams>(Routes.tutorialsRoot, "/:tutorialId/:stepIndex");
}