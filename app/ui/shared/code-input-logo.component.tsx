import * as React from 'react';
import * as codemirror from 'codemirror';
import { Observable, Subscription, Subject } from 'rxjs'

import { ensure } from 'app/utils/syntax-helpers';
import { ThemeService } from 'app/services/theme.service';

import 'node_modules/codemirror/addon/runmode/runmode.js';
import 'node_modules/codemirror/addon/edit/closebrackets.js';
import 'node_modules/codemirror/addon/edit/matchbrackets.js';
import 'node_modules/codemirror/addon/display/placeholder.js';

import 'app/../lib/codemirror-logo/cm-logo.js';

import './code-input-logo.component.scss';

interface IComponentState {
}

interface IComponentProps {
    className?: string
    code: string
    requestFocusEvents?: Observable<void>
    onHotkey?: (key: string) => void
    onChanged: (code: string) => void
}

export class CodeInputLogoComponent extends React.Component<IComponentProps, IComponentState> {
    themeService = new ThemeService();
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
            theme: this.themeService.getCurrentTheme().codemirror
        } as any);
        this.cm.setSize('100%', '100%');
        this.cm.setValue(this.props.code);
        this.cm.on("change", () => {
            let newVal = this.cm.getValue();
            this.props.onChanged(newVal);
        });
        if (this.props.onHotkey) {
            const map = {
                "F8": () => { ensure(this.props.onHotkey)('f8') },
                "F9": () => { ensure(this.props.onHotkey)('f9') }
            };
            this.cm.addKeyMap(map);
        }

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