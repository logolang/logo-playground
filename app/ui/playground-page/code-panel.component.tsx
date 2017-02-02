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
}

export class CodePanelComponent extends React.Component<IComponentProps, IComponentState> {
    playgroundEvents = ServiceLocator.resolve(x => x.playgroundEvents);
    currentCodeLocalStorage = new LocalStorageService<string>('logo-sandbox-codeplayground', 'cs\r\nfd 100');

    constructor(props: IComponentProps) {
        super(props);

        this.state = {
            code: this.currentCodeLocalStorage.getValue()
        }
    }

    componentDidMount() {
        this.playgroundEvents.setCode(this.state.code);
    }

    codeChanged = (code: string) => {
        this.setState({ code: code });
        this.currentCodeLocalStorage.setValue(code);
        this.playgroundEvents.setCode(code);
    }

    render(): JSX.Element {
        return (
            <div ref="container" className="code-panel-container">
                <div className="code-input-container">
                    <CodeInputLogoComponent code={this.state.code} onChanged={this.codeChanged}>
                    </CodeInputLogoComponent>
                </div>
            </div>
        );
    }
}