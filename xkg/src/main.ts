// src/main.ts
import { HelloXGraphics } from "./examples/HelloXGraphics";
import { XGraphicsTS, LRect, XMouseEvent, XMouseEventType, XKeyEvent, XKeyEventType } from "./gui/XGraphics";
import { Vec2d } from "./util/Vec2d";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

if (!canvas || !ctx) {
    throw new Error("Could not find canvas or context");
}

const xg = new XGraphicsTS(canvas, ctx);
const app = new HelloXGraphics();

canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const pos = new Vec2d(e.clientX - rect.left, e.clientY - rect.top);
    app.handleMouseEvent(new XMouseEvent(XMouseEventType.Down, pos));
});

canvas.addEventListener("mouseup", (e) => {
    const rect = canvas.getBoundingClientRect();
    const pos = new Vec2d(e.clientX - rect.left, e.clientY - rect.top);
    app.handleMouseEvent(new XMouseEvent(XMouseEventType.Up, pos));
});

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const pos = new Vec2d(e.clientX - rect.left, e.clientY - rect.top);
    app.handleMouseEvent(new XMouseEvent(XMouseEventType.Moved, pos));
});

window.addEventListener("keydown", (e) => {
    app.handleKeyEvent(new XKeyEvent(XKeyEventType.Pressed, e.keyCode));
});

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    app.paint(xg);
    requestAnimationFrame(loop);
}

loop();
