import "app/../lib/logojs/floodfill.js";
import "app/../lib/logojs/turtle.js";

function $(s: string) {
  return document.querySelector(s);
}

export class LogoOutputGraphics {
  turtle: any;
  width: number;
  height: number;

  constructor(private sandBoxSelector: string, private turtleSelector: string) {}

  initTurtle(turtleCustomImage?: HTMLImageElement, turtleSize?: number) {
    const CanvasTurtle: any = (window as any)["CanvasTurtle"];
    const canvas_element = $(this.sandBoxSelector) as HTMLCanvasElement;
    const canvas_ctx = canvas_element.getContext("2d");
    const turtle_element = $(this.turtleSelector) as HTMLCanvasElement;
    const turtle_ctx = turtle_element.getContext("2d");
    this.width = canvas_element.width;
    this.height = canvas_element.height;

    const turtleOptions = {
      customTurtleGraphics: turtleCustomImage,
      customTurtleSize: turtleSize
    };

    this.turtle = new CanvasTurtle(canvas_ctx, turtle_ctx, this.width, this.height, undefined, turtleOptions);
    return this.turtle;
  }

  resizeCanvas(width: number, height: number) {
    if (!height || !width) {
      return;
    }
    width = Math.trunc(width);
    height = Math.trunc(height);
    if (height === this.height && width === this.width) {
      return;
    }
    this.width = width;
    this.height = height;
    const sandbox = $(this.sandBoxSelector) as HTMLCanvasElement;
    const turtle = $(this.turtleSelector) as HTMLCanvasElement;
    sandbox.width = width;
    sandbox.height = height;
    turtle.width = width;
    turtle.height = height;
  }

  createScreenshot(isThumbnail: boolean): string {
    const canvasElt = $(this.sandBoxSelector) as HTMLCanvasElement;
    if (canvasElt) {
      return isThumbnail ? this.prepareThumbnail(canvasElt) : canvasElt.toDataURL();
    }
    return "";
  }

  // The crop and resize function
  private prepareThumbnail(canvas: HTMLCanvasElement): string {
    const targetRect = {
      width: 200,
      height: 150
    };
    const clipRect = {
      width: Math.min(400, canvas.width),
      height: Math.min(300, canvas.width)
    };
    const sourceOffset = {
      x: (canvas.width - clipRect.width) / 2,
      y: (canvas.height - clipRect.height) / 2
    };

    // create an in-memory canvas
    const buffer = document.createElement("canvas");
    const b_ctx = buffer.getContext("2d");
    if (!b_ctx) {
      return "";
    }
    // set its width/height to the required ones
    buffer.width = targetRect.width;
    buffer.height = targetRect.height;
    // draw the main canvas on our buffer one
    b_ctx.drawImage(
      canvas,
      sourceOffset.x,
      sourceOffset.y,
      clipRect.width,
      clipRect.height,
      0,
      0,
      targetRect.width,
      targetRect.height
    );
    // now call the callback with the dataURL of our buffer canvas
    return buffer.toDataURL();
  }
}
