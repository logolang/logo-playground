import * as React from 'react';
import * as codemirror from 'codemirror';

import 'node_modules/codemirror/addon/runmode/runmode.js';
import 'node_modules/codemirror/addon/edit/closebrackets.js';
import 'node_modules/codemirror/addon/edit/matchbrackets.js';
import 'node_modules/codemirror/addon/display/placeholder.js';

import 'app/../lib/codemirror-logo/cm-logo.js';
import 'app/../lib/codemirror-logo/cm-logo.css';

import 'node_modules/codemirror/lib/codemirror.css'

import { ServiceLocator } from 'app/services/service-locator';
import { LocalStorageService } from 'app/services/local-storage.service';
import { LogoExecutionService } from 'app/services/logo/logo-execution-service'

import './code-panel.component.scss'

interface IComponentState {
}

interface IComponentProps {
}

export class CodePanelComponent extends React.Component<IComponentProps, IComponentState> {
    currentCodeLocalStorage = new LocalStorageService<string>('temp_code', 'cs\r\nfd 100');
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
        this.cm.setValue(this.currentCodeLocalStorage.getValue());
        setInterval(() => {
            this.cm.focus();
        }, 100);
    }

    componentWillUnmount() {
    }

    render(): JSX.Element {
        return (
            <div ref="container" className="code-placeholder">
                <textarea ref="text-area" rows={10}>
                </textarea>
                <div className="code-controls">
                    <button type="button" className="btn btn-default btn-lg" onClick={this.runCode}>
                        <span className="glyphicon glyphicon-play" aria-hidden="true"></span><span> Run</span>
                    </button>
                </div>
            </div>
        );
    }

    runCode = () => {
        const code = this.cm.getValue();
        this.currentCodeLocalStorage.setValue(code);
        const logoService = ServiceLocator.resolve(x => x.logo);
        logoService.run(code);
    }
}