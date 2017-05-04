import * as React from 'react';
import { RouteComponentProps } from "react-router";
import * as cn from 'classnames';
import { Subscription } from "rxjs/Subscription";

import { MainMenuComponent } from "app/ui/main-menu.component";
import { PageHeaderComponent } from "app/ui/_generic/page-header.component";

import { _T } from "app/services/customizations/localization.service";
import { ServiceLocator } from 'app/services/service-locator'
import { Routes } from "app/routes";

interface IComponentState {
}

interface IComponentProps extends RouteComponentProps<void> {
}

export class LoginComponent extends React.Component<IComponentProps, IComponentState> {
    private appConfig = ServiceLocator.resolve(x => x.appConfig);
    private currentUser = ServiceLocator.resolve(x => x.currentUser);
    private titleService = ServiceLocator.resolve(x => x.titleService);
    private navService = ServiceLocator.resolve(x => x.navigationService);
    private loginSubscription: Subscription;

    constructor(props: IComponentProps) {
        super(props);

        this.state = {
        };

        this.titleService.setDocumentTitle(_T("Log in"));
    }

    componentDidMount = () => {
        this.currentUser.initLoginUIAllProviders();
        this.loginSubscription = this.currentUser.loginStatusObservable.subscribe((status) => {
            if (status) {
                setTimeout(() => {
                    this.navService.navigate({ route: Routes.root.build({}) });
                }, 400);
            }
        })
    }

    componentWillUnmount() {
        if (this.loginSubscription) {
            this.loginSubscription.unsubscribe();
        }
    }

    render(): JSX.Element {
        return (
            <div className="container">
                <MainMenuComponent />
                <PageHeaderComponent title={_T("Log in")} />
                <br />
                <br />
                {this.currentUser.renderLoginUIAllProviders()}
            </div>
        );
    }
}
