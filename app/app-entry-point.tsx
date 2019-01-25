// Include polyfills to work in IE11
import "core-js";

import "app/ui/_styles/app.less";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";

import { normalizeError } from "app/utils/error";
import { AlertMessage } from "app/ui/_generic/alert-message";
import { MainContainer } from "app/main.container";
import { store } from "./store/store";
import { envActionCreator } from "./store/env/actions.env";

async function runApp() {
  const appHostDomElement = document.getElementById("app-container") || document.body;
  store.dispatch(envActionCreator.initEnv());
  try {
    // Render the app
    ReactDOM.render(
      <Provider store={store}>
        <MainContainer />
      </Provider>,
      appHostDomElement
    );
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
