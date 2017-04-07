import * as React from 'react';
import * as cn from 'classnames';
import * as codemirror from 'codemirror';
import { Observable, Subscription, Subject } from 'rxjs'

import { ensure } from 'app/utils/syntax-helpers';

import 'node_modules/codemirror/addon/runmode/runmode.js';
import 'node_modules/codemirror/addon/edit/closebrackets.js';
import 'node_modules/codemirror/addon/edit/matchbrackets.js';
import 'node_modules/codemirror/addon/display/placeholder.js';

import 'app/../lib/codemirror-logo/cm-logo.js';

import './code-input-logo.component.scss';

interface IComponentState {
}

export interface ICodeInputComponentProps {
    className?: string
    code: string
    focusCommands?: Observable<void>
    onHotkey?: (key: string) => void
    onChanged: (code: string) => void
    editorTheme: string
}

export class CodeInputLogoComponent extends React.Component<ICodeInputComponentProps, IComponentState> {
    cm: codemirror.EditorFromTextArea;
    currentCode: string;
    focusCommandsSubscription: Subscription | undefined;

    constructor(props: ICodeInputComponentProps) {
        super(props);

        this.state = {
        }
    }

    shouldComponentUpdate() {
        return false;
    }

    componentWillReceiveProps(nextProps: ICodeInputComponentProps) {
        if (this.cm) {
            if (nextProps.code != this.currentCode) {
                this.cm.setValue(nextProps.code);
            }
        }
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
            lineWrapping: true,
            theme: this.props.editorTheme
        } as any);
        this.cm.setSize('100%', '100%');
        this.cm.on("change", () => {
            let newVal = this.cm.getValue();
            this.currentCode = newVal;
            this.props.onChanged(newVal);
        });
        this.cm.setValue(this.props.code);
        if (this.props.onHotkey) {
            const map = {
                "F8": () => { ensure(this.props.onHotkey)('f8') },
                "F9": () => { ensure(this.props.onHotkey)('f9') }
            };
            this.cm.addKeyMap(map);
        }

        if (this.props.focusCommands) {
            this.focusCommandsSubscription = this.props.focusCommands.subscribe(() => {
                this.cm.focus();
            });
        }
    }

    componentWillUnmount() {
        if (this.focusCommandsSubscription) {
            this.focusCommandsSubscription.unsubscribe();
        }
    }

    render(): JSX.Element {
        return (
            <div ref="container" className={cn("code-input-logo-component", this.props.className)}>
                <textarea ref="text-area">
                </textarea>
            </div>
        );
    }
}