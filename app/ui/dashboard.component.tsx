import * as React from 'react';
import { Link } from 'react-router'

import { ServiceLocator } from 'app/services/service-locator'
import { PageHeaderComponent } from 'app/ui/shared/generic/page-header.component';


interface IDashboardComponentState {
    userName: string;
}

interface IDashboardComponentProps {
}

export class DashboardComponent extends React.Component<IDashboardComponentProps, IDashboardComponentState> {
    private appConfig = ServiceLocator.resolve(x => x.appConfig);
    private currentUser = ServiceLocator.resolve(x => x.currentUser);

    constructor(props: IDashboardComponentProps) {
        super(props);

        this.state = {
            userName: this.currentUser.getLoginStatus().userInfo.attributes.name
        };
    }

    render(): JSX.Element {
        return (
            <div className="container">
                <PageHeaderComponent title="Dashboard" />
                <div className="row">
                    <div className="col-sm-12">
                        <p>Welcome, {this.state.userName}</p>
                    </div>
                </div>
            </div>
        );
    }
}