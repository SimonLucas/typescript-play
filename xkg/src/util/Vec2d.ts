export class Vec2d {
    constructor(public x: number = 0.0, public y: number = 0.0) {}

    add(v: Vec2d): Vec2d {
        return new Vec2d(this.x + v.x, this.y + v.y);
    }

    sub(v: Vec2d): Vec2d {
        return new Vec2d(this.x - v.x, this.y - v.y);
    }

    scale(scalar: number): Vec2d {
        return new Vec2d(this.x * scalar, this.y * scalar);
    }

    dot(v: Vec2d): number {
        return this.x * v.x + this.y * v.y;
    }

    wAdd(v: Vec2d, scalar: number): Vec2d {
        return new Vec2d(this.x + v.x * scalar, this.y + v.y * scalar);
    }

    mag(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    distance(v: Vec2d): number {
        return this.sub(v).mag();
    }

    angle(): number {
        return Math.atan2(this.y, this.x);
    }

    rotate(angle: number): Vec2d {
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        return new Vec2d(
            this.x * cosA - this.y * sinA,
            this.x * sinA + this.y * cosA
        );
    }

    rotatedBy(theta: number): Vec2d {
        return this.rotate(theta);
    }

    normalize(): Vec2d {
        const m = this.mag();
        return m > 0.0 ? this.scale(1.0 / m) : this;
    }

    toString(): string {
        return `Vec2d(${this.x}, ${this.y})`;
    }
}
