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

    createScreenshot(): string {
        const canvasElt = $('#sandbox') as HTMLCanvasElement;
        if (canvasElt) {
            return this.prepareScreenshot(canvasElt);
        }
        return '';
    }

    // The crop and resize function
    private prepareScreenshot(canvas: HTMLCanvasElement): string {
        const targetRect = {
            width: 133, height: 100
        }
        const clipRect = {
            width: Math.min(400, canvas.width),
            height: Math.min(300, canvas.width)
        };
        const sourceOffset = {
            x: (canvas.width - clipRect.width) / 2,
            y: (canvas.height - clipRect.height) / 2
        };

        // create an in-memory canvas
        let buffer = document.createElement('canvas');
        let b_ctx = buffer.getContext('2d');
        if (!b_ctx) {
            return '';
        }
        // set its width/height to the required ones
        buffer.width = targetRect.width;
        buffer.height = targetRect.height;
        // draw the main canvas on our buffer one
        b_ctx.drawImage(canvas, sourceOffset.x, sourceOffset.y, clipRect.width, clipRect.height,
            0, 0, targetRect.width, targetRect.height);
        // now call the callback with the dataURL of our buffer canvas
        return buffer.toDataURL('image/jpeg', 0.8);
    };

}