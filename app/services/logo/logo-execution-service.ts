import { Subject } from 'rxjs/Subject'
import 'app/../lib/logojs/floodfill.js';
import 'app/../lib/logojs/logo.js';
import 'app/../lib/logojs/turtle.js';

import { LogoConsoleStream } from './logo-console-stream'

function $(s: any) { return document.querySelector(s); }

export class LogoExecutionService {
    private codeSubj = new Subject<string>()

    constructor() {
        this.codeSubj.subscribe((code) => {
            this.executeTheCode(code);
        })
    }

    initialize() {

    }

    destroy() {

    }

    run(code: string) {
        this.codeSubj.next(code);
    }

    private executeTheCode(code: string) {
        let CanvasTurtle: any = (window as any)['CanvasTurtle'];
        let LogoInterpreter: any = (window as any)['LogoInterpreter'];

        let canvas_element = $('#sandbox') as HTMLCanvasElement;
        let canvas_ctx = canvas_element.getContext('2d');
        let turtle_element = $('#turtle') as HTMLCanvasElement;
        let turtle_ctx = turtle_element.getContext('2d');

        let turtle = new CanvasTurtle(
            canvas_ctx,
            turtle_ctx,
            canvas_element.width, canvas_element.height, $('#overlay'));

        let logo = new LogoInterpreter(
            turtle,
            new LogoConsoleStream('#overlay'),
            function (name: any, def: any) { }
        );

        logo.run(code).catch(function (e: any) {
            console.error('error', e);
        });
    }
}