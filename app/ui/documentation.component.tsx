import * as React from 'react';
import { Link } from 'react-router';

import { setupActionErrorHandler, callAction } from "app/utils/async-helpers";

import { ServiceLocator } from 'app/services/service-locator'
import { MainMenuComponent } from 'app/ui/main-menu.component'
import { PageHeaderComponent } from 'app/ui/_generic/page-header.component';
import { PageLoadingIndicatorComponent } from 'app/ui/_generic/page-loading-indicator.component';
import { AlertMessageComponent } from 'app/ui/_generic/alert-message.component';

import './documentation.component.scss'

interface IComponentState {
    isLoading: boolean
    content: string
}

interface IComponentProps {
}

export class DocumentationComponent extends React.Component<IComponentProps, IComponentState> {
    private notificationService = ServiceLocator.resolve(x => x.notificationService);
    private contentLoader = ServiceLocator.resolve(x => x.contentLoader);

    constructor(props: IComponentProps) {
        super(props);

        this.state = {
            isLoading: true,
            content: ''
        };
    }

    componentDidMount() {
        this.loadData();
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