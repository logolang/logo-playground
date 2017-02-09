import * as React from 'react';
import { Observable } from 'rxjs';

import { CodeInputLogoComponent } from 'app/ui/shared/code-input-logo.component';

import './code-panel.component.scss'

export interface ICodePanelComponentProps {
    code: string
    codeChanged: (code: string) => void
    onHotkey: (key: string) => void
    focusEvents: Observable<void>
}

export class CodePanelComponent extends React.Component<ICodePanelComponentProps, void> {

    constructor(props: ICodePanelComponentProps) {
        super(props);
    }

    render(): JSX.Element {
        return (
            <div ref="container" className="code-panel-container">
                <CodeInputLogoComponent
                    className="code-input-container"
                    code={this.props.code}
                    onChanged={this.props.codeChanged}
                    onHotkey={this.props.onHotkey}
                    requestFocusEvents={this.props.focusEvents}>
                </CodeInputLogoComponent>
            </div>
        );
    }
}