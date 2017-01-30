import * as React from 'react';
import { Link } from 'react-router'

import { ServiceLocator } from 'app/services/service-locator'
import { PageHeaderComponent } from 'app/ui/shared/generic/page-header.component';

interface IComponentState {
}

interface IComponentProps {
}

export class AboutComponent extends React.Component<IComponentProps, IComponentState> {
    private appConfig = ServiceLocator.resolve(x => x.appConfig);

    constructor(props: IComponentProps) {
        super(props);

        this.state = {
        };
    }

    render(): JSX.Element {
        return (
            <div className="container">
                <PageHeaderComponent title="About" />
                <div className="row">
                    <div className="col-sm-12">
                        <p>This is a simple template application</p>
                        <p><strong>Package Name:</strong> {appInfo.name}</p>
                        <p><strong>App Version:</strong> {appInfo.version}</p>
                        <p><strong>Code Version:</strong> {appInfo.gitVersion}</p>
                        <p><strong>Build:</strong> {appInfo.buildVersion}</p>
                    </div>
                </div>
            </div>
        );
    }
}