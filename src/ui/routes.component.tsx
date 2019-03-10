import * as React from "react";
import { Route, Redirect, Switch } from "react-router-dom";

import { Routes } from "./routes";

import { GalleryContainer } from "ui/gallery/gallery.container";
import { PlaygroundContainer } from "ui/playground/playground.container";
import { TutorialsContainer } from "ui/tutorials/tutorials.container";
import { LoginPageContainer } from "./login-page.container";
import { InfoPage } from "ui/info-page";
import { SettingsPageContainer } from "ui/settings-page.container";

export const RoutesComponent = (): JSX.Element => (
  <Switch>
    <Route path={Routes.loginPage.path} component={LoginPageContainer} />

    <Route path={Routes.gallery.path} component={GalleryContainer} />

    <Route path={Routes.settings.path} component={SettingsPageContainer} />

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
