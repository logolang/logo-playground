import * as React from 'react';
import * as codemirror from 'codemirror';
import { Observable, Subscription } from 'rxjs'

import 'node_modules/codemirror/addon/runmode/runmode.js';
import 'node_modules/codemirror/addon/edit/closebrackets.js';
import 'node_modules/codemirror/addon/edit/matchbrackets.js';
import 'node_modules/codemirror/addon/display/placeholder.js';

import 'app/../lib/codemirror-logo/cm-logo.js';

import 'node_modules/codemirror/lib/codemirror.css'
import 'node_modules/codemirror/theme/eclipse.css'
import 'node_modules/codemirror/theme/mdn-like.css'
import 'node_modules/codemirror/theme/icecoder.css'
import 'node_modules/codemirror/theme/seti.css'

import './code-input-logo.component.scss'

interface IComponentState {
}

interface IComponentProps {
    className?: string
    code: string
    requestFocusEvents?: Observable<void>
    onChanged: (code: string) => void
}

export class CodeInputLogoComponent extends React.Component<IComponentProps, IComponentState> {
    cm: codemirror.EditorFromTextArea;
    focusEventsSubscription: Subscription | undefined;

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
            lineWrapping: true,
            theme: 'default'
        } as any);
        this.cm.setSize('100%', '100%');
        this.cm.setValue(this.props.code);
        this.cm.on("change", () => {
            let newVal = this.cm.getValue();
            this.props.onChanged(newVal);
        });
        if (this.props.requestFocusEvents) {
            this.focusEventsSubscription = this.props.requestFocusEvents.subscribe(() => {
                this.cm.focus();
            });
        }
    }

    componentWillUnmount() {
        if (this.focusEventsSubscription) {
            this.focusEventsSubscription.unsubscribe();
        }
    }

    render(): JSX.Element {
        return (
            <div ref="container" className={`${this.props.className}`}>
                <textarea ref="text-area">
                </textarea>
            </div>
        );
    }
}