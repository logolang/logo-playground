import * as React from 'react';
import { Link } from 'react-router'

import { handleError } from 'app/utils/react-helpers';

import { ServiceLocator } from 'app/services/service-locator'
import { MainMenuComponent } from 'app/ui/main-menu.component'
import { PageHeaderComponent } from 'app/ui/shared/generic/page-header.component';
import { ErrorMessageComponent } from 'app/ui//shared/generic/error-message.component';
import { PageLoadingIndicatorComponent } from 'app/ui//shared/generic/page-loading-indicator.component';

import { ITutorialInfo, ITutorialStep } from 'app/services/tutorials-content-service';

interface IComponentState {
    isLoading: boolean
    errorMessage: string
    tutorialInfos: ITutorialInfo[]
    currentSteps: ITutorialStep[]
}

interface IComponentProps {
}

export class TutorialsComponent extends React.Component<IComponentProps, IComponentState> {
    private tutorialsLoader = ServiceLocator.resolve(x => x.tutorialsService);

    constructor(props: IComponentProps) {
        super(props);

        this.state = {
            isLoading: true,
            errorMessage: '',
            tutorialInfos: [],
            currentSteps: []
        };
    }

    componentDidMount() {
        this.loadData();
    }

    private async loadData() {
        const tutorialInfos = await handleError(this, () => this.tutorialsLoader.getTutorialsList());
        if (tutorialInfos) {
            this.setState({ tutorialInfos: tutorialInfos });

            const steps = await handleError(this, () => this.tutorialsLoader.getSteps(tutorialInfos[0].id));
            if (steps) {
                this.setState({ currentSteps: steps });
            }
        }
        this.setState({ isLoading: false });
    }

    render(): JSX.Element {
        return (
            <div className="container-fluid">
                <MainMenuComponent />
                <PageHeaderComponent title="Tutorials" />
                <PageLoadingIndicatorComponent isLoading={this.state.isLoading}>
                    <ErrorMessageComponent errorMessage={this.state.errorMessage} />
                    <div className="row">
                        <div className="col-sm-12">
                            {
                                this.state.tutorialInfos.map(t => <p>{t.name} ({t.steps})</p>)
                            }
                            <hr />
                            {
                                this.state.currentSteps.map(t => <div> <h3>{t.name}</h3><p>{t.content}</p></div>)
                            }
                        </div>
                    </div>
                </PageLoadingIndicatorComponent>
            </div>
        );
    }
}