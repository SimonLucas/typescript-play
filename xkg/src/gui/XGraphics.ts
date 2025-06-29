// src/gui/XGraphics.ts
import { Vec2d } from "../util/Vec2d";
import {
    Drawable, GeomDrawable,XColor, XStyle, TStyle,
    XRect, XRoundedRect, XLine, XPoly, XText
} from "./Drawable";

export interface XGraphics {
    width(): number;
    height(): number;
    draw(toDraw: Drawable): void;
    drawables(): Drawable[];
    redraw(): void;
    setBounds(rect: LRect): void;
    releaseBounds(): void;
    saveTransform(): void;
    restoreTransform(): void;
    setTranslate(x: number, y: number): void;
    setScale(x: number, y: number): void;
    style: XStyle;
    centre(): Vec2d;
}

export class LRect {
    constructor(
        public xLeft: number,
        public yTop: number,
        public width: number,
        public height: number
    ) {}
}
// Types and interfaces for user interaction

// Mouse event types
export enum XMouseEventType {
    Down,
    Up,
    Moved,
    Dragged,
    Clicked
}

export class XMouseEvent {
    constructor(
        public t: XMouseEventType,
        public s: Vec2d
    ) {}
}

// Key event types
export enum XKeyEventType {
    Pressed,
    Released,
    Typed,
    Down
}

export class XKeyEvent {
    constructor(
        public t: XKeyEventType,
        public keyCode: number
    ) {}
}

// XApp interface
export interface XApp {
    paint(xg: XGraphics): void;
    handleMouseEvent(e: XMouseEvent): void;
    handleKeyEvent(e: XKeyEvent): void;
}

export class XGraphicsTS implements XGraphics {
    private ctx: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;
    private _style: XStyle = new XStyle();
    private transformStack: DOMMatrix[] = [];
    private _drawables: Drawable[] = [];
    private bounds: LRect | null = null;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.ctx = ctx;
    }

    width(): number {
        return this.bounds ? this.bounds.width : this.canvas.width;
    }

    height(): number {
        return this.bounds ? this.bounds.height : this.canvas.height;
    }

    setBounds(rect: LRect): void {
        this.bounds = rect;
    }

    releaseBounds(): void {
        this.bounds = null;
    }

    setTranslate(x: number, y: number): void {
        this.ctx.translate(x, y);
    }

    setScale(x: number, y: number): void {
        this.ctx.scale(x, y);
    }

    saveTransform(): void {
        this.ctx.save();
    }

    restoreTransform(): void {
        this.ctx.restore();
    }

    draw(toDraw: Drawable): void {
        this._drawables.push(toDraw);

        if (toDraw instanceof XRect) this.drawRect(toDraw);
        else if (toDraw instanceof XRoundedRect) this.drawRoundedRect(toDraw);
        else if (toDraw instanceof XLine) this.drawLine(toDraw);
        else if (toDraw instanceof XText) this.drawText(toDraw);
        else if (toDraw instanceof XPoly) this.drawPoly(toDraw);
    }

    drawables(): Drawable[] {
        return this._drawables;
    }

    redraw(): void {
        // For now, do nothing
    }

    centre(): Vec2d {
        return new Vec2d(this.width() / 2, this.height() / 2);
    }

    get style(): XStyle {
        return this._style;
    }

    set style(s: XStyle) {
        this._style = s;
    }

    private applyStyle(style: XStyle, fillOnly = false): void {
        this.ctx.fillStyle = this.colorToRgba(style.fg);
        if (!fillOnly) {
            this.ctx.strokeStyle = this.colorToRgba(style.lc);
            this.ctx.lineWidth = style.lineWidth;
        }
    }

    private colorToRgba(c: XColor): string {
        return `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${c.a})`;
    }

    private drawRect(r: XRect): void {
        this.ctx.save();
        this.ctx.translate(r.centre.x, r.centre.y);
        this.ctx.rotate(r.rotation);
        this.applyStyle(r.dStyle);
        if (r.dStyle.fill) this.ctx.fillRect(-r.w / 2, -r.h / 2, r.w, r.h);
        if (r.dStyle.stroke) this.ctx.strokeRect(-r.w / 2, -r.h / 2, r.w, r.h);
        this.ctx.restore();
    }

    private drawRoundedRect(r: XRoundedRect): void {
        const arc = r.radInPercent ? Math.min(r.w, r.h) * r.cornerRad : r.cornerRad;
        this.ctx.save();
        this.ctx.translate(r.centre.x, r.centre.y);
        this.ctx.rotate(r.rotation);
        this.applyStyle(r.dStyle);
        this.ctx.beginPath();
        this.roundedRectPath(-r.w / 2, -r.h / 2, r.w, r.h, arc);
        if (r.dStyle.fill) this.ctx.fill();
        if (r.dStyle.stroke) this.ctx.stroke();
        this.ctx.restore();
    }

    private roundedRectPath(x: number, y: number, w: number, h: number, r: number): void {
        this.ctx.moveTo(x + r, y);
        this.ctx.lineTo(x + w - r, y);
        this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        this.ctx.lineTo(x + w, y + h - r);
        this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.ctx.lineTo(x + r, y + h);
        this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        this.ctx.lineTo(x, y + r);
        this.ctx.quadraticCurveTo(x, y, x + r, y);
    }

    private drawLine(l: XLine): void {
        const mid = l.a.add(l.b).scale(0.5);
        const a = l.a.sub(mid);
        const b = l.b.sub(mid);
        this.ctx.save();
        this.ctx.translate(mid.x, mid.y);
        this.ctx.rotate(l.rotation);
        this.applyStyle(l.dStyle);
        if (l.dStyle.stroke) {
            this.ctx.beginPath();
            this.ctx.moveTo(a.x, a.y);
            this.ctx.lineTo(b.x, b.y);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }

    private drawText(t: XText): void {
        this.ctx.save();
        this.ctx.translate(t.p.x, t.p.y);
        this.ctx.rotate(t.rotation);
        if (t.tStyle.flipped) this.ctx.scale(1, -1);
        this.ctx.fillStyle = this.colorToRgba(t.tStyle.fg);
        this.ctx.font = `${t.tStyle.size}px ${t.tStyle.font}`;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(t.str, 0, 0);
        this.ctx.restore();
    }

    private drawPoly(p: XPoly): void {
        if (p.points.length < 2) return;
        this.ctx.save();
        this.ctx.translate(p.centre.x, p.centre.y);
        this.ctx.rotate(p.rotation);
        this.applyStyle(p.dStyle);
        this.ctx.beginPath();
        const pts = p.points;
        this.ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
            this.ctx.lineTo(pts[i].x, pts[i].y);
        }
        if (p.closed) this.ctx.closePath();
        if (p.dStyle.fill) this.ctx.fill();
        if (p.dStyle.stroke) this.ctx.stroke();
        this.ctx.restore();
    }
}
