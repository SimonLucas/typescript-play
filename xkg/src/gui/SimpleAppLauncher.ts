// src/gui/AppLauncher.ts
import { Vec2d } from "../util/Vec2d";
import { XApp } from "./XGraphics";
import { XGraphicsTS } from "./XGraphics";

export class SimpleAppLauncher {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  xg: XGraphicsTS;
  static globFrameRate = 25.0;
  private intervalId: number | null = null;

  constructor(
    public app: XApp,
    public preferredWidth: number = 800,
    public preferredHeight: number = 600,
    public frameRate: number = 25.0,
    public title: string = "Planet Wars"
  ) {
    SimpleAppLauncher.globFrameRate = frameRate;

    this.canvas = document.createElement("canvas");
    this.canvas.width = preferredWidth;
    this.canvas.height = preferredHeight;
    this.canvas.tabIndex = 0;
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext("2d")!;
    this.xg = new XGraphicsTS(this.canvas, this.ctx);

    this.installEventHandlers();
  }

  private installEventHandlers(): void {
    this.canvas.addEventListener("mousedown", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.app.handleMouseEvent({ t: 0, s: new Vec2d(x, y) });
    });

    this.canvas.addEventListener("keydown", (e) => {
      this.app.handleKeyEvent({ t: 0, keyCode: e.keyCode });
    });
  }

  launch(): void {
    const delay = 1000 / this.frameRate;

    this.intervalId = window.setInterval(() => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.app.paint(this.xg);
    }, delay);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
