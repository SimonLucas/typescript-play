// src/gui/AppLauncher.ts
import { Vec2d } from "../util/Vec2d";
import { XApp } from "./XGraphics";
import { XGraphicsTS } from "./XGraphics";

export class AppLauncher {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  xg: XGraphicsTS;
  static globFrameRate = 25.0;

  private running = false;
  private lastFrameTime = 0;
  private frameCount = 0;
  private fps = 0;
  private lastFpsTime = 0;

  constructor(
    public app: XApp,
    public preferredWidth: number = 800,
    public preferredHeight: number = 600,
    public frameRate: number = 25.0,
    public title: string = "Planet Wars"
  ) {
    AppLauncher.globFrameRate = frameRate;

    // Create and configure canvas
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
    this.running = true;
    this.lastFrameTime = performance.now();
    this.lastFpsTime = this.lastFrameTime;
    requestAnimationFrame(this.loop.bind(this));
  }

  private loop(now: number): void {
    const elapsed = now - this.lastFrameTime;
    const minFrameTime = 1000 / AppLauncher.globFrameRate;

    if (elapsed >= minFrameTime) {
      this.lastFrameTime = now;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.app.paint(this.xg);

      // Debug overlay
      this.frameCount++;
      if (now - this.lastFpsTime >= 1000) {
        this.fps = this.frameCount;
        this.frameCount = 0;
        this.lastFpsTime = now;
      }

      this.ctx.fillStyle = "rgba(0,0,0,0.6)";
      this.ctx.font = "14px monospace";
      this.ctx.fillText(`FPS: ${this.fps}`, 10, 20);
      this.ctx.fillText(`Tick: ${this.frameCount}`, 10, 40);
    }

    if (this.running) {
      requestAnimationFrame(this.loop.bind(this));
    }
  }
}
