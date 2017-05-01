// Include polyfills to work in IE11
import 'core-js';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { DependencyConfig } from 'app/dependency-config'
import { ErrorComponent } from 'app/ui/error.component';
import { Routes } from 'app/routes';

import 'app/ui/_styles/app.scss';

async function runApp() {
    const appHostDomElement = document.getElementById('app-container') || document.body;
    try {
        await DependencyConfig.init();

        // Render the app
        ReactDOM.render(
            <Routes />,
            appHostDomElement
        )
    }
    catch (ex) {
        ReactDOM.render(
            <ErrorComponent
                headerText="Application failed because of error"
                error={ex}
            />,
            appHostDomElement
        );
        throw ex;
    };
}

Object.assign(window, {
    app: {
        run: runApp
    }
});