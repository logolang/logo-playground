import { Subject } from 'rxjs/Subject'
import 'app/../lib/logojs/floodfill.js';
import 'app/../lib/logojs/logo.js';
import 'app/../lib/logojs/turtle.js';

import { ICodeExecutor } from '../code-executor';
import { LogoConsoleStream } from './logo-console-stream'

function $(s: any) { return document.querySelector(s); }

const polyfills = `
to ellipse :w :h
  localmake "initxcor xcor
  localmake "initycor ycor
  localmake "initangle 0
  localmake "x_pos (:initxcor + ((sin :initangle) * :w/2))
  localmake "y_pos (:initycor + ((cos :initangle) * :h/2))
  repeat 36[
    penup
    setxy :x_pos :y_pos
    pendown
    localmake "angle (:initangle + (repcount*10))
    localmake "x_pos (:initxcor +((sin :angle) * :w/2))
    localmake "y_pos (:initycor +((cos :angle) * :h/2))
    setxy :x_pos :y_pos
  ]
  penup
  setxy :initxcor :initycor
  pendown
end
`;

export class LogoExecutionService implements ICodeExecutor {
    private logo: any;

    constructor() {
    }

    initialize() {
    }

    destroy() {
    }

    async execute(code: string): Promise<void> {
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

        this.logo = new LogoInterpreter(
            turtle,
            new LogoConsoleStream('#overlay'),
            function (name: any, def: any) { }
        );

        try {
            await this.logo.run(polyfills + code);
        }
        catch (ex) {
            console.error('error', ex);
        };
    }

    abort(): void {
        if (this.logo) {
            this.logo.bye();
        }
    }
}