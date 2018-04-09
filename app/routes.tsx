import * as React from "react";
import { Route, Redirect, Switch } from "react-router-dom";

import { RouteInfo } from "app/utils/route-info";
import { LoginPageComponent } from "app/ui/login.page.component";
import { GalleryPageComponent } from "app/ui/gallery/gallery.page.component";
import { UserProfilePageComponent } from "app/ui/user-profile.page.component";
import { InfoPageComponent } from "app/ui/info.page.component";
import { PlaygroundPageComponent } from "app/ui/playground/playground.page.component";
import { ProgramStorageType } from "app/services/program/program-management.service";
import { CheatSheetPageComponent } from "app/ui/cheat-sheet/cheat-sheet.page.component";
import { TutorialsPageComponent, ITutorialPageRouteParams } from "app/ui/tutorials/tutorials.page.component";

export const RoutesComponent = (): JSX.Element => (
  <Switch>
    <Route path={Routes.loginRoot.relativePath} component={LoginPageComponent} />

    <Route path={Routes.galleryRoot.relativePath} component={GalleryPageComponent} />

    <Route path={Routes.settingsRoot.relativePath} component={UserProfilePageComponent} />

    <Route path={Routes.infoRoot.relativePath} component={InfoPageComponent} />

    <Route exact path={Routes.playground.relativePath} component={PlaygroundPageComponent} />
    <Route
      exact
      path={Routes.codeGist.relativePath}
      render={props => (
        <PlaygroundPageComponent storageType={ProgramStorageType.gist} programId={props.match.params.id} />
      )}
    />
    <Route
      exact
      path={Routes.codeExample.relativePath}
      render={props => (
        <PlaygroundPageComponent storageType={ProgramStorageType.samples} programId={props.match.params.id} />
      )}
    />
    <Route
      exact
      path={Routes.codeLibrary.relativePath}
      render={props => (
        <PlaygroundPageComponent storageType={ProgramStorageType.gallery} programId={props.match.params.id} />
      )}
    />

    <Route path={Routes.cheatSheetRoot.relativePath} component={CheatSheetPageComponent} />

    <Route exact path={Routes.tutorialsRoot.relativePath} component={TutorialsPageComponent} />
    <Route exact path={Routes.tutorialSpecified.relativePath} component={TutorialsPageComponent} />

    <Redirect from="/" to={Routes.galleryRoot.relativePath} />

    {/* Default route will be used in case if nothing matches */}
    <Route component={GalleryPageComponent} />
  </Switch>
);

export class Routes {
  static readonly root = new RouteInfo(undefined, "/");

  static readonly loginRoot = new RouteInfo(Routes.root, "/login");

  static readonly infoRoot = new RouteInfo(Routes.root, "/info");
  static readonly settingsRoot = new RouteInfo(Routes.root, "/settings");

  static readonly galleryRoot = new RouteInfo(Routes.root, "/gallery");

  static readonly playground = new RouteInfo(Routes.root, "/playground");
  static readonly codeGist = new RouteInfo<{ id: string }>(Routes.root, "/shared/:id");
  static readonly codeLibrary = new RouteInfo<{ id: string }>(Routes.root, "/library/:id");
  static readonly codeExample = new RouteInfo<{ id: string }>(Routes.root, "/example/:id");

  static readonly cheatSheetRoot = new RouteInfo(Routes.root, "/cheat-sheet");

  static readonly tutorialsRoot = new RouteInfo(Routes.root, "/tutorials");
  static readonly tutorialSpecified = new RouteInfo<ITutorialPageRouteParams>(
    Routes.tutorialsRoot,
    "/:tutorialId/:stepId"
  );
}
