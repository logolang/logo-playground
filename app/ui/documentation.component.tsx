import * as React from 'react';
import { Link } from 'react-router';

import { handleError } from '../utils/react-helpers';

import { ServiceLocator } from 'app/services/service-locator'
import { MainMenuComponent } from 'app/ui/main-menu.component'
import { PageHeaderComponent } from 'app/ui/_generic/page-header.component';
import { PageLoadingIndicatorComponent } from 'app/ui/_generic/page-loading-indicator.component';
import { AlertMessageComponent } from 'app/ui/_generic/alert-message.component';

import './documentation.component.scss'

interface IComponentState {
    isLoading: boolean
    errorMessage: string
    content: string
}

interface IComponentProps {
}

export class DocumentationComponent extends React.Component<IComponentProps, IComponentState> {
    contentLoader = ServiceLocator.resolve(x => x.contentLoader);

    constructor(props: IComponentProps) {
        super(props);

        this.state = {
            isLoading: true,
            errorMessage: '',
            content: ''
        };
    }

    componentDidMount() {
        this.loadData();
    }

    private async loadData() {
        const content = await handleError(this, () => this.contentLoader.getFileContent('reference.html'));
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
                        <AlertMessageComponent message={this.state.errorMessage} />
                        <div className="doc-section" dangerouslySetInnerHTML={{ __html: this.state.content }}></div>
                        <br />
                    </PageLoadingIndicatorComponent>
                </div>
            </div>
        );
    }
}