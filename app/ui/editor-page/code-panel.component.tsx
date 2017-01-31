import { RandomHelper } from '../../utils/random-helper';
import * as React from 'react';
import * as codemirror from 'codemirror';

import 'node_modules/codemirror/addon/runmode/runmode.js';
import 'node_modules/codemirror/addon/edit/closebrackets.js';
import 'node_modules/codemirror/addon/edit/matchbrackets.js';
import 'node_modules/codemirror/addon/display/placeholder.js';

import 'app/../lib/logojs/cm/logo.js';
import 'node_modules/codemirror/lib/codemirror.css'
import 'app/../lib/logojs/cm/logo.css';
import './code-panel.component.scss'

import 'app/../lib/logojs/floodfill.js';
import 'app/../lib/logojs/logo.js';
import 'app/../lib/logojs/turtle.js';

interface IComponentState {
}

interface IComponentProps {
}

function $(s: any) { return document.querySelector(s); }
function $$(s: any) { return document.querySelectorAll(s); }
let stream = {
    read: function (s: any) {
        return window.prompt(s ? s : "");
    },
    write: function () {
        let div = $('#overlay');
        for (let i = 0; i < arguments.length; i += 1) {
            div.innerHTML += arguments[i];
        }
        div.scrollTop = div.scrollHeight;
    },
    clear: function () {
        let div = $('#overlay');
        div.innerHTML = "";
    },
    readback: function () {
        let div = $('#overlay');
        return div.innerHTML;
    },
    get textsize() {
        return parseFloat($('#overlay').style.fontSize.replace('px', ''));
    },
    set textsize(height) {
        $('#overlay').style.fontSize = Math.max(height, 1) + 'px';
    },
    get font() {
        return $('#overlay').style.fontFamily;
    },
    set font(name) {
        if (['serif', 'sans-serif', 'cursive', 'fantasy', 'monospace'].indexOf(name) === -1) {
            name = JSON.stringify(name);
        }
        $('#overlay').style.fontFamily = name;
    },
    get color() {
        return $('#overlay').style.color;
    },
    set color(color) {
        $('#overlay').style.color = color;
    }
};

export class CodePanelComponent extends React.Component<IComponentProps, IComponentState> {
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
        this.cm.setValue('fd 50\r\nrt 90\r\nfd 67\r\nlt 50\r\nfd 68');
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
        let CanvasTurtle: any = (window as any)['CanvasTurtle'];
        let LogoInterpreter: any = (window as any)['LogoInterpreter'];

        let canvas_element = $("#sandbox");
        let canvas_ctx = canvas_element.getContext('2d');
        let turtle_element = $("#turtle");
        let turtle_ctx = turtle_element.getContext('2d');

        let turtle = new CanvasTurtle(
            canvas_ctx,
            turtle_ctx,
            canvas_element.width, canvas_element.height, $('#overlay'));

        let logo = new LogoInterpreter(
            turtle, stream,
            function (name: any, def: any) { }
        );
        /*
        logo.run('cs');
        let program = '';
        for (let i = 0; i < RandomHelper.getRandomInt(5, 10); ++i) {
            program += 'fd ' + RandomHelper.getRandomInt(34, 65) + ' ';
            program += RandomHelper.getRandomInt(0, 1) == 0 ? 'lt ' : 'rt ';
            program += RandomHelper.getRandomInt(34, 65) + ' ';
        }
        console.log(program);
        */
        logo.run(this.cm.getValue());
    }
}