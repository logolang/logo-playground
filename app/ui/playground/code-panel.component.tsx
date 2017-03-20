import * as React from 'react';
import { Observable } from 'rxjs';

import { CodeInputLogoComponent, ICodeInputComponentProps } from 'app/ui/_shared/code-input-logo.component';

import './code-panel.component.scss'

export interface ICodePanelComponentProps {
    codeInputProps: ICodeInputComponentProps
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
                    code={this.props.codeInputProps.code}
                    onChanged={this.props.codeInputProps.onChanged}
                    onHotkey={this.props.codeInputProps.onHotkey}
                    focusCommands={this.props.codeInputProps.focusCommands}>
                </CodeInputLogoComponent>
            </div>
        );
    }
}