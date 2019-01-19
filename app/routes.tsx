import * as React from "react";
import { Route, Redirect, Switch } from "react-router-dom";

import { RouteInfo } from "app/utils/route-info";
import { ProgramStorageType } from "./services/program/program.model";
import { LoginPage } from "app/ui/login-page";
import { UserProfilePage } from "app/ui/user-profile";
import { InfoPage } from "app/ui/info-page";
import { PlaygroundContainer } from "app/ui/playground/playground.container";
import { CheatSheet } from "app/ui/cheat-sheet/cheat-sheet";
import { TutorialsContainer } from "app/ui/tutorials/tutorials.container";
import { GalleryContainer } from "app/ui/gallery/gallery.container";

export const RoutesComponent = (): JSX.Element => (
  <Switch>
    <Route path={Routes.loginPage.path} component={LoginPage} />

    <Route path={Routes.gallery.path} component={GalleryContainer} />

    <Route path={Routes.settings.path} component={UserProfilePage} />

    <Route path={Routes.infoPage.path} component={InfoPage} />

    <Route path={Routes.cheatSheet.path} component={CheatSheet} />

    <Route path={Routes.tutorials.path} component={TutorialsContainer} />

    <Route exact path={Routes.playgroundDefault.path} component={PlaygroundContainer} />
    <Route
      exact
      path={Routes.playground.path}
      render={props => (
        <PlaygroundContainer storageType={props.match.params.storageType} programId={props.match.params.id} />
      )}
    />

    <Redirect from="/" to={Routes.gallery.path} />

    {/* Default route will be used in case if nothing matches */}
    <Route component={GalleryContainer} />
  </Switch>
);

export class Routes {
  static readonly loginPage = new RouteInfo("/login");
  static readonly infoPage = new RouteInfo("/info");
  static readonly settings = new RouteInfo("/settings");
  static readonly gallery = new RouteInfo("/gallery");
  static readonly playgroundDefault = new RouteInfo("/code");
  static readonly playground = new RouteInfo<{ storageType: ProgramStorageType; id: string }>("/code/:storageType/:id");
  static readonly cheatSheet = new RouteInfo("/cheat-sheet");
  static readonly tutorials = new RouteInfo("/tutorials");
}
