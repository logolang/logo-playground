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
            <div className="code-panel-container">
                {React.createElement(CodeInputLogoComponent, { ...this.props.codeInputProps, className: "code-input-container" })}
            </div>
        );
    }
}