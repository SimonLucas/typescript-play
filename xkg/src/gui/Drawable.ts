// src/gui/Drawable.ts
import { Vec2d } from "../util/Vec2d";

export class XColor {
    constructor(public r: number = 0, public g: number = 0, public b: number = 0, public a: number = 1.0) {}

    static red = new XColor(1, 0, 0);
    static green = new XColor(0, 1, 0);
    static blue = new XColor(0, 0, 1);
    static magenta = new XColor(1, 0, 1);
    static cyan = new XColor(0, 1, 1);
    static yellow = new XColor(1, 1, 0);
    static white = new XColor(1, 1, 1);
    static black = new XColor(0, 0, 0);
    static gray = new XColor(0.5, 0.5, 0.5);
    static pink = new XColor(1, 0.5, 0.5);
    static purple = new XColor(0.5, 0, 0.5);
    static orange = new XColor(1, 0.5, 0);
    static brown = new XColor(0.5, 0.25, 0);
}

export class XStyle {
    constructor(
        public fg: XColor = XColor.black,
        public bg: XColor = XColor.white,
        public lc: XColor = XColor.red,
        public stroke: boolean = true,
        public fill: boolean = true,
        public lineWidth: number = 2.0
    ) {}
}

export class TStyle {
    constructor(
        public fg: XColor = XColor.cyan,
        public font: string = "Arial",
        public size: number = 16.0,
        public flipped: boolean = false
    ) {}
}
// Interfaces

export interface Drawable {
    dStyle: XStyle;
    rotation: number;
}

export interface GeomDrawable extends Drawable {
    centre: Vec2d;
    contains(p: Vec2d | null): boolean;
    radius(): number;
}

// Shapes

export class XRect implements GeomDrawable {
    constructor(
        public centre: Vec2d,
        public w: number,
        public h: number,
        public dStyle: XStyle = new XStyle(),
        public rotation: number = 0
    ) {}

    contains(p: Vec2d | null): boolean {
        if (!p) return false;
        const tp = p.sub(this.centre).rotatedBy(-this.rotation);
        return Math.abs(tp.x) <= this.w / 2 && Math.abs(tp.y) <= this.h / 2;
    }

    radius(): number {
        return Math.max(this.w / 2, this.h / 2);
    }

    copy(): XRect {
        return new XRect(this.centre, this.w, this.h, this.dStyle, this.rotation);
    }
}

export class XRoundedRect implements GeomDrawable {
    constructor(
        public centre: Vec2d,
        public w: number,
        public h: number,
        public cornerRad: number = 0.025,
        public radInPercent: boolean = true,
        public dStyle: XStyle = new XStyle(),
        public rotation: number = 0
    ) {}

    contains(p: Vec2d | null): boolean {
        if (!p) return false;
        const tp = p.sub(this.centre).rotatedBy(-this.rotation);
        return Math.abs(tp.x) <= this.w / 2 && Math.abs(tp.y) <= this.h / 2;
    }

    radius(): number {
        return Math.max(this.w / 2, this.h / 2);
    }
}

export class XLine implements Drawable {
    constructor(
        public a: Vec2d,
        public b: Vec2d,
        public dStyle: XStyle = new XStyle(),
        public rotation: number = 0
    ) {}
}

export class XText implements Drawable {
    constructor(
        public str: string,
        public p: Vec2d,
        public tStyle: TStyle = new TStyle(),
        public dStyle: XStyle = new XStyle(),
        public rotation: number = 0
    ) {}
}

export class XPoly implements GeomDrawable {
    public rad: number;

    constructor(
        public centre: Vec2d = new Vec2d(),
        public points: Vec2d[] = [],
        public dStyle: XStyle = new XStyle(),
        public rotation: number = 0,
        public closed: boolean = true
    ) {
        this.rad = 0.0;
        this.points.forEach(p => {
            this.rad = Math.max(this.rad, p.mag());
        });
    }

    contains(p: Vec2d | null): boolean {
        if (!p) return false;
        const tp = p.sub(this.centre).rotatedBy(-this.rotation);
        if (tp.mag() > this.rad) return false;
        return this.simplePolyContains(tp);
    }

    radius(): number {
        return this.rad;
    }

    private simplePolyContains(p: Vec2d): boolean {
        let inside = false;
        const n = this.points.length;
        for (let i = 0, j = n - 1; i < n; j = i++) {
            const pi = this.points[i];
            const pj = this.points[j];
            if (
                (pi.y > p.y !== pj.y > p.y) &&
                (p.x < (pj.x - pi.x) * (p.y - pi.y) / (pj.y - pi.y + 1e-10) + pi.x)
            ) {
                inside = !inside;
            }
        }
        return inside;
    }
}
