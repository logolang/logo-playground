import * as React from 'react';

import { ServiceLocator } from 'app/services/service-locator';
import { LocalStorageService } from 'app/services/local-storage.service';
import { LogoExecutionService } from 'app/services/logo/logo-execution-service'

import { CodeInputLogoComponent } from './code-input-logo.component';

import './code-panel.component.scss'

interface IComponentState {
    code: string
}

interface IComponentProps {
}

export class CodePanelComponent extends React.Component<IComponentProps, IComponentState> {
    currentCodeLocalStorage = new LocalStorageService<string>('logo-sandbox-codeplayground', 'cs\r\nfd 100');

    constructor(props: IComponentProps) {
        super(props);

        this.state = {
            code: this.currentCodeLocalStorage.getValue()
        }
    }

    codeChanged = (code: string) => {
        this.setState({ code: code });
        console.log('new code', code);
    }

    render(): JSX.Element {
        return (
            <div ref="container" className="code-panel-container">
                <div className="code-controls">
                    <button type="button" className="btn btn-default btn-lg run-button" onClick={this.runCode}>
                        <span className="glyphicon glyphicon-play" aria-hidden="true"></span><span> Run</span>
                    </button>
                </div>
                <div className="code-input-container">
                    <CodeInputLogoComponent code={this.state.code} onChanged={this.codeChanged}>
                    </CodeInputLogoComponent>
                </div>
            </div>
        );
    }

    runCode = () => {
        const code = this.state.code;
        this.currentCodeLocalStorage.setValue(code);
        const logoService = ServiceLocator.resolve(x => x.logo);
        logoService.run(code);
    }
}