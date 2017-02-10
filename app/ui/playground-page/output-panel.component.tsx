import * as React from 'react';
import * as jquery from 'jquery'
import { Subject } from 'rxjs'

import { LogoExecutorComponent, ILogoExecutorComponentProps } from 'app/ui/shared/logo-executor.component';

import './output-panel.component.scss'

interface IComponentState {
}

export interface IOutputPanelComponentProps {
    logoExecutorProps: ILogoExecutorComponentProps
}

export class OutputPanelComponent extends React.Component<IOutputPanelComponentProps, IComponentState> {
    constructor(props: IOutputPanelComponentProps) {
        super(props);

        this.state = {
        }
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    render(): JSX.Element {
        return (
            <div className="output-container">
                <LogoExecutorComponent
                    onError={this.props.logoExecutorProps.onError}
                    runCommands={this.props.logoExecutorProps.runCommands}
                    stopCommands={this.props.logoExecutorProps.stopCommands}
                    onIsRunningChanged={this.props.logoExecutorProps.onIsRunningChanged}
                    makeScreenshotCommands={this.props.logoExecutorProps.makeScreenshotCommands}
                />
            </div>
        );
    }
}