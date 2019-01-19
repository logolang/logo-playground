// Include polyfills to work in IE11
import "core-js";

import "app/ui/_styles/app.less";

import * as React from "react";
import * as ReactDOM from "react-dom";

import { normalizeError } from "app/utils/error-helpers";
import { DependecyInjectionSetupService } from "app/di-setup";
import { AlertMessage } from "app/ui/_generic/alert-message";
import { Main } from "app/main";

async function runApp() {
  const appHostDomElement = document.getElementById("app-container") || document.body;
  const diService = new DependecyInjectionSetupService();
  try {
    await diService.setup();

    // Render the app
    ReactDOM.render(<Main />, appHostDomElement);
  } catch (ex) {
    const error = await normalizeError(ex);
    ReactDOM.render(
      <div className="ex-page-container">
        <div className="ex-page-content">
          <div className="container">
            <br />
            <br />
            <br />
            <h1 className="title">Application failed</h1>
            <AlertMessage title={error.name} message={error.message} />
          </div>
        </div>
      </div>,
      appHostDomElement
    );
    throw ex;
  }
}

Object.assign(window, {
  app: {
    run: runApp
  }
});
