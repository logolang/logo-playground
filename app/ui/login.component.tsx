import * as React from 'react';
import { RouteComponentProps } from "react-router";
import * as cn from 'classnames';
import { Subscription } from "rxjs/Subscription";

import { MainMenuComponent } from "app/ui/main-menu.component";
import { PageHeaderComponent } from "app/ui/_generic/page-header.component";

import { lazyInject } from "app/di";
import { Routes } from "app/routes";
import { _T } from "app/services/customizations/localization.service";
import { ICurrentUserProvider } from "app/services/login/current-user.provider";
import { TitleService } from "app/services/infrastructure/title.service";
import { INavigationService } from "app/services/infrastructure/navigation.service";

interface IComponentState {
}

interface IComponentProps extends RouteComponentProps<void> {
}

export class LoginComponent extends React.Component<IComponentProps, IComponentState> {
    @lazyInject(ICurrentUserProvider)
    private currentUser: ICurrentUserProvider;

    @lazyInject(TitleService)
    private titleService: TitleService;

    @lazyInject(INavigationService)
    private navService: INavigationService;

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
