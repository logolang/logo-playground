import * as React from "react";
import { Route, Redirect, Switch } from "react-router-dom";

import { RouteInfo } from "app/utils/route-info";
import { ProgramStorageType } from "./services/program/program.model";
import { LoginPageComponent } from "app/ui/login.page.component";
import { UserProfilePageComponent } from "app/ui/user-profile.page.component";
import { InfoPageComponent } from "app/ui/info.page.component";
import { PlaygroundPageComponent } from "app/ui/playground/playground.page.component";
import { CheatSheetPageComponent } from "app/ui/cheat-sheet/cheat-sheet.page.component";
import { TutorialsPageComponent, ITutorialPageRouteParams } from "app/ui/tutorials/tutorials.page.component";
import { GalleryPageContainer } from "app/ui/gallery/gallery.page.container";

export const RoutesComponent = (): JSX.Element => (
  <Switch>
    <Route path={Routes.loginRoot.path} component={LoginPageComponent} />

    <Route exact path={Routes.galleryRoot.path} render={() => <GalleryPageContainer />} />

    <Route path={Routes.settingsRoot.path} component={UserProfilePageComponent} />

    <Route path={Routes.infoRoot.path} component={InfoPageComponent} />

    <Route exact path={Routes.playground.path} component={PlaygroundPageComponent} />
    <Route
      exact
      path={Routes.codeGist.path}
      render={props => (
        <PlaygroundPageComponent storageType={ProgramStorageType.gist} programId={props.match.params.id} />
      )}
    />
    <Route
      exact
      path={Routes.codeExample.path}
      render={props => (
        <PlaygroundPageComponent storageType={ProgramStorageType.samples} programId={props.match.params.id} />
      )}
    />
    <Route
      exact
      path={Routes.codeLibrary.path}
      render={props => (
        <PlaygroundPageComponent storageType={ProgramStorageType.gallery} programId={props.match.params.id} />
      )}
    />

    <Route path={Routes.cheatSheetRoot.path} component={CheatSheetPageComponent} />

    <Route exact path={Routes.tutorialsRoot.path} component={TutorialsPageComponent} />
    <Route exact path={Routes.tutorialSpecified.path} component={TutorialsPageComponent} />

    <Redirect from="/" to={Routes.galleryRoot.path} />

    {/* Default route will be used in case if nothing matches */}
    <Route render={() => <GalleryPageContainer />} />
  </Switch>
);

export class Routes {
  static readonly loginRoot = new RouteInfo("/login");
  static readonly infoRoot = new RouteInfo("/info");
  static readonly settingsRoot = new RouteInfo("/settings");
  static readonly galleryRoot = new RouteInfo("/gallery");
  static readonly playground = new RouteInfo("/playground");
  static readonly codeGist = new RouteInfo<{ id: string }>("/shared/:id");
  static readonly codeLibrary = new RouteInfo<{ id: string }>("/library/:id");
  static readonly codeExample = new RouteInfo<{ id: string }>("/example/:id");
  static readonly cheatSheetRoot = new RouteInfo("/cheat-sheet");
  static readonly tutorialsRoot = new RouteInfo("/tutorials");
  static readonly tutorialSpecified = new RouteInfo<ITutorialPageRouteParams>("/tutorials/:tutorialId/:stepId");
}
