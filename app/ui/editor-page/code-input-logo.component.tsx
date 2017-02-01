import * as React from 'react';
import * as codemirror from 'codemirror';

import 'node_modules/codemirror/addon/runmode/runmode.js';
import 'node_modules/codemirror/addon/edit/closebrackets.js';
import 'node_modules/codemirror/addon/edit/matchbrackets.js';
import 'node_modules/codemirror/addon/display/placeholder.js';

import 'app/../lib/codemirror-logo/cm-logo.js';
import 'app/../lib/codemirror-logo/cm-logo.css';

import 'node_modules/codemirror/lib/codemirror.css'

import './code-input-logo.component.scss'

interface IComponentState {
}

interface IComponentProps {
    code: string
    onChanged: (code: string) => void
}

export class CodeInputLogoComponent extends React.Component<IComponentProps, IComponentState> {
    cm: codemirror.EditorFromTextArea;

    constructor(props: IComponentProps) {
        super(props);

        this.state = {
        }
    }

    shouldComponentUpdate() {
        return false;
    }

    componentDidMount() {
        const containerElement = this.refs['container'] as HTMLElement;
        const textArea = this.refs['text-area'] as HTMLTextAreaElement;

        const BRACKETS = '()[]{}';
        this.cm = codemirror.fromTextArea(textArea, {
            mode: 'logo',
            autoCloseBrackets: { pairs: BRACKETS, explode: BRACKETS },
            matchBrackets: true,
            lineComment: ';',
            lineNumbers: true,
            lineWrapping: true
        } as any);
        this.cm.setSize('100%', '100%');
        this.cm.setValue(this.props.code);
        this.cm.on("change", () => {
            let newVal = this.cm.getValue();
            this.props.onChanged(newVal);
        });
        setInterval(() => {
            this.cm.focus();
        }, 500);
    }

    componentWillUnmount() {
    }

    render(): JSX.Element {
        return (
            <div ref="container" className="code-input">
                <textarea ref="text-area">
                </textarea>
            </div>
        );
    }
}