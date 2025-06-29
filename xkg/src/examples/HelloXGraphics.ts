// src/examples/HelloXGraphics.ts
import { Vec2d } from "../util/Vec2d";
import { XGraphics, XApp,XMouseEvent, XMouseEventType, 
     XKeyEvent, XKeyEventType, PolyUtil } from "../gui/XGraphics";
import { XColor, XStyle, TStyle, XRect, XRoundedRect, XLine,
     XPoly, XText} from "../gui/Drawable";

export class HelloXGraphics implements XApp {
    private hexAngle = 0.0;
    private angleInc = Math.PI / 180;
    private fillHex = true;

    paint(xg: XGraphics): void {
        const centre = new Vec2d(xg.width() / 2, xg.height() / 2);

        const rect = new XRect(centre, xg.width() / 2, xg.height() / 2);
        const bgRect = rect.copy();
        bgRect.dStyle = new XStyle(XColor.magenta, XColor.white, XColor.magenta, false, true, 10.0);
        bgRect.w = xg.width();
        bgRect.h = xg.height();

        xg.draw(bgRect);
        xg.draw(rect);

        const thickWhite = new XStyle(XColor.white, XColor.white, XColor.white, true, false, 10.0);

        xg.draw(new XLine(new Vec2d(0, 0), new Vec2d(xg.width(), xg.height()), thickWhite));
        xg.draw(new XLine(new Vec2d(0, xg.height()), new Vec2d(xg.width(), 0), thickWhite));

        this.hexAngle += this.angleInc;

        const points = new PolyUtil().makePolygon(6, xg.height() / 5, this.hexAngle);
        const poly = new XPoly(centre, points);
        poly.dStyle.fg = new XColor(0.5, 1, 0);
        poly.dStyle.lc = new XColor(0.5, 0, 1);
        poly.dStyle.lineWidth = 5.0;
        poly.dStyle.fill = this.fillHex;

        xg.draw(poly);

        const roundedRect = new XRoundedRect(
            new Vec2d(xg.width() / 8, xg.height() / 8),
            xg.width() / 4,
            xg.height() / 4,
            50.0,
            false,
            new XStyle(XColor.red, XColor.white, XColor.black, true, true, 2.0),
            this.hexAngle
        );
        xg.draw(roundedRect);

        const text = new XText(
            "Hello XKG",
            centre,
            new TStyle(XColor.black),
            new XStyle(),
            this.hexAngle
        );
        xg.draw(text);
    }

    handleMouseEvent(e: XMouseEvent): void {
        // no-op
    }

    handleKeyEvent(e: XKeyEvent): void {
        if (e.t === XKeyEventType.Pressed) {
            this.fillHex = !this.fillHex;
        }
    }
}
