import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';

import { setupActionErrorHandler, callAction } from "app/utils/async-helpers";

import { MainMenuComponent } from 'app/ui/main-menu.component'
import { PageHeaderComponent } from 'app/ui/_generic/page-header.component';
import { PageLoadingIndicatorComponent } from 'app/ui/_generic/page-loading-indicator.component';
import { AlertMessageComponent } from 'app/ui/_generic/alert-message.component';

import { lazyInject } from "app/di";
import { _T } from "app/services/customizations/localization.service";
import { INotificationService } from "app/services/infrastructure/notification.service";
import { TitleService } from "app/services/infrastructure/title.service";
import { ILocalizedContentLoader } from "app/services/infrastructure/localized-content-loader";

import './documentation.component.scss'

interface IComponentState {
    isLoading: boolean
    content: string
}

interface IComponentProps extends RouteComponentProps<void> {
}

export class DocumentationComponent extends React.Component<IComponentProps, IComponentState> {
    @lazyInject(INotificationService)
    private notificationService: INotificationService;

    @lazyInject(TitleService)
    private titleService: TitleService;

    @lazyInject(ILocalizedContentLoader)
    private contentLoader: ILocalizedContentLoader;

    constructor(props: IComponentProps) {
        super(props);

        this.state = {
            isLoading: true,
            content: ''
        };
    }

    componentDidMount() {
        this.loadData();
        this.titleService.setDocumentTitle(_T("Documentation"));
    }

    private async loadData() {
        const errorHandler = setupActionErrorHandler((error) => {
            this.notificationService.push({ type: 'danger', message: error });
            this.setState({ isLoading: false });
        })

        const content = await callAction(errorHandler, () => this.contentLoader.getFileContent('reference.html'));
        if (content) {
            this.setState({ content: content });
        }
        this.setState({ isLoading: false });
    }

    render(): JSX.Element {
        return (
            <div className="ex-page-container">
                <MainMenuComponent />
                <div className="ex-scroll-outer container-fluid">
                    <PageLoadingIndicatorComponent isLoading={this.state.isLoading}>
                        <div className="doc-section" dangerouslySetInnerHTML={{ __html: this.state.content }}></div>
                        <br />
                    </PageLoadingIndicatorComponent>
                </div>
            </div>
        );
    }
}