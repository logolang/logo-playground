// Include polyfills to work in IE11
import "core-js";

import * as React from "react";
import * as ReactDOM from "react-dom";
//Expose react and react router in order for golden layout work
(window as any)["React"] = React;
(window as any)["ReactDOM"] = ReactDOM;

import { Routes } from "app/routes";
import { DependecyInjectionSetup } from "app/di-setup";

import { GlobalErrorPage } from "app/ui/global-error.page.component";

import "app/ui/_styles/app.scss";

async function runApp() {
  const appHostDomElement = document.getElementById("app-container") || document.body;
  try {
    await DependecyInjectionSetup.setup();

    // Render the app
    ReactDOM.render(<Routes />, appHostDomElement);
  } catch (ex) {
    ReactDOM.render(<GlobalErrorPage headerText="Application failed because of error" error={ex} />, appHostDomElement);
    throw ex;
  }
}

Object.assign(window, {
  app: {
    run: runApp
  }
});
