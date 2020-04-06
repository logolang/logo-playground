import "app/../lib/logojs/floodfill.js";
import "app/../lib/logojs/turtle.js";

function $(s: string) {
  return document.querySelector(s);
}

declare const CanvasTurtle: new (
  canvasContext: CanvasRenderingContext2D | null,
  width: number,
  height: number,
  events: unknown,
  options: {
    turtleElement: HTMLImageElement;
    turtleSize: number;
  }
) => unknown;

export class LogoOutputGraphics {
  turtle: unknown;
  width: number;
  height: number;

  constructor(private sandBoxSelector: string, private turtleSelector: string) {}

  init(turtleSize: number) {
    const canvasElement = $(this.sandBoxSelector) as HTMLCanvasElement;
    const canvasCtx = canvasElement.getContext("2d");
    const turtleElement = $(this.turtleSelector) as HTMLImageElement;
    this.width = canvasElement.width;
    this.height = canvasElement.height;

    this.turtle = new CanvasTurtle(canvasCtx, this.width, this.height, undefined, {
      turtleElement: turtleElement,
      turtleSize: turtleSize
    });
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
    sandbox.width = width;
    sandbox.height = height;
  }

  createScreenshot(isThumbnail: boolean): string {
    const canvasElt = $(this.sandBoxSelector) as HTMLCanvasElement;
    if (canvasElt) {
      return isThumbnail
        ? this.prepareThumbnail(canvasElt)
        : canvasElt.toDataURL("image/jpeg", 1.0);
    }
    return "";
  }

  // The crop and resize function
  private prepareThumbnail(canvas: HTMLCanvasElement): string {
    const targetRect = {
      width: 200,
      height: 150
    };
    let clipRectWidth = Math.min(400, canvas.width);
    let clipRectHeight = (clipRectWidth * 3) / 4;
    if (clipRectHeight > canvas.height) {
      clipRectHeight = canvas.height;
      clipRectWidth = (clipRectHeight * 4) / 3;
    }

    const sourceOffset = {
      x: (canvas.width - clipRectWidth) / 2,
      y: (canvas.height - clipRectHeight) / 2
    };

    // create an in-memory canvas
    const buffer = document.createElement("canvas");
    const bCtx = buffer.getContext("2d");
    if (!bCtx) {
      return "";
    }
    // set its width/height to the required ones
    buffer.width = targetRect.width;
    buffer.height = targetRect.height;
    // draw the main canvas on our buffer one
    bCtx.drawImage(
      canvas,
      sourceOffset.x,
      sourceOffset.y,
      clipRectWidth,
      clipRectHeight,
      0,
      0,
      targetRect.width,
      targetRect.height
    );
    // now call the callback with the dataURL of our buffer canvas
    return buffer.toDataURL("image/jpeg", 1.0);
  }
}
