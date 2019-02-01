import * as React from "react";
import { Route, Redirect, Switch } from "react-router-dom";

import { LoginPage } from "app/ui/login-page";
import { UserProfileContainer } from "app/ui/user-profile.container";
import { InfoPage } from "app/ui/info-page";
import { PlaygroundContainer } from "app/ui/playground/playground.container";
import { TutorialsContainer } from "app/ui/tutorials/tutorials.container";
import { GalleryContainer } from "app/ui/gallery/gallery.container";
import { Routes } from "./routes";

export const RoutesComponent = (): JSX.Element => (
  <Switch>
    <Route path={Routes.loginPage.path} component={LoginPage} />

    <Route path={Routes.gallery.path} component={GalleryContainer} />

    <Route path={Routes.settings.path} component={UserProfileContainer} />

    <Route path={Routes.infoPage.path} component={InfoPage} />

    <Route path={Routes.tutorials.path} component={TutorialsContainer} />

    <Route exact path={Routes.playgroundDefault.path} component={PlaygroundContainer} />
    <Route
      exact
      path={Routes.playground.path}
      render={props => (
        <PlaygroundContainer
          storageType={props.match.params.storageType}
          programId={props.match.params.id}
        />
      )}
    />

    <Redirect from="/" to={Routes.gallery.path} />

    {/* Default route will be used in case if nothing matches */}
    <Route component={GalleryContainer} />
  </Switch>
);
