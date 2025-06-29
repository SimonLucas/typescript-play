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
