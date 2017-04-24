import * as React from 'react';
import { Link } from 'react-router'

import { ServiceLocator } from 'app/services/service-locator'
import { MainMenuComponent } from 'app/ui/main-menu.component'
import { PageHeaderComponent } from 'app/ui/_generic/page-header.component';
import { _T } from "app/services/customizations/localization.service";

interface IComponentState {
}

interface IComponentProps {
}

export class AboutComponent extends React.Component<IComponentProps, IComponentState> {
    private appConfig = ServiceLocator.resolve(x => x.appConfig);
    private titleService = ServiceLocator.resolve(x => x.titleService);

    constructor(props: IComponentProps) {
        super(props);

        this.state = {
        };

        this.titleService.setDocumentTitle(_T("About"));
    }

    render(): JSX.Element {
        return (
            <div className="container">
                <MainMenuComponent />
                <PageHeaderComponent title={_T("About")} />
                <div className="row">
                    <div className="col-sm-12">
                        <p>{appInfo.description}</p>
                        <p><strong>{_T("Package name")}:</strong> {appInfo.name}</p>
                        <p><strong>{_T("App version")}:</strong> {appInfo.version}</p>
                        <p><strong>{_T("Code version")}:</strong> {appInfo.gitVersion}</p>
                    </div>
                </div>
            </div>
        );
    }
}