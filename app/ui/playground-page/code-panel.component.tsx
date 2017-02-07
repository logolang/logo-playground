import * as React from 'react';

import { ServiceLocator } from 'app/services/service-locator';
import { LocalStorageService } from 'app/services/local-storage.service';
import { LogoExecutionService } from 'app/services/logo/logo-execution-service'

import { CodeInputLogoComponent } from 'app/ui/shared/code-input-logo.component';

import './code-panel.component.scss'

interface IComponentState {
    code: string
}

interface IComponentProps {
    code: string
    codeChanged: (code: string) => void
}

export class CodePanelComponent extends React.Component<IComponentProps, IComponentState> {
    private playgroundContext = ServiceLocator.resolve(x => x.playgroundContext);

    constructor(props: IComponentProps) {
        super(props);

        this.state = {
            code: this.props.code
        }
    }

    codeChanged = (code: string) => {
        this.setState({ code: code });
        this.props.codeChanged(code);
    }

    onHotkey = (key: string) => {
        this.playgroundContext.run();
    }

    render(): JSX.Element {
        return (
            <div ref="container" className="code-panel-container">
                <CodeInputLogoComponent
                    className="code-input-container"
                    code={this.state.code}
                    onChanged={this.codeChanged}
                    onHotkey={this.onHotkey}
                    requestFocusEvents={this.playgroundContext.requestFocusEvents}>
                </CodeInputLogoComponent>
            </div>
        );
    }
}