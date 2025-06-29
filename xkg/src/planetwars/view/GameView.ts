// src/planetwars/view/GameView.ts

import { GameParams } from "../core/GameParams";
import { GameState, Player, Transporter, Planet } from "../core/GameState";
import { GameRunner } from "../core/GameRunner";
import {
  XApp,
  XGraphics,
  XKeyEvent,
  XMouseEvent,
  XMouseEventType,
  XKeyEventType,
} from "../../gui/XGraphics";

import {
  XColor,
  XStyle,
  XText,
  TStyle,
  XRect,
  XPoly,
  XEllipse,
} from "../../gui/Drawable";

import { Vec2d } from "../../util/Vec2d";

export class ColorScheme {
  background = XColor.black;
  neutral = XColor.gray;
  playerOne = XColor.red;
  playerTwo = XColor.blue;
  text = XColor.white;
  planetOutline = XColor.gray;
  transporterOutline = XColor.white;

  getColor(player: Player): XColor {
    if (player === Player.Player1) return this.playerOne;
    if (player === Player.Player2) return this.playerTwo;
    return this.neutral;
  }
}

export class GameView implements XApp {
  width: number;
  height: number;
  paused = false;
  showInfoFor: Set<Player> = new Set([Player.Player1]);

  constructor(
    public gameState: GameState,
    public params: GameParams = new GameParams(),
    public colors: ColorScheme = new ColorScheme(),
    public gameRunner: GameRunner | null = null,
  ) {
    this.width = params.width;
    this.height = params.height;
  }

  paint(xg: XGraphics): void {
    const scaleX = xg.width() / this.width;
    const scaleY = xg.height() / this.height;
    const scale = Math.min(scaleX, scaleY);
    const offsetX = (xg.width() / scale - this.width) / 2;
    const offsetY = (xg.height() / scale - this.height) / 2;

    xg.saveTransform();
    xg.setScale(scale, scale);
    xg.setTranslate(offsetX, offsetY);

    if (!this.paused) this.gameStep();

    this.drawBackground(xg);
    this.drawPlanets(xg);
    this.drawTransporters(xg);
    this.drawStatus(xg);

    xg.restoreTransform();
  }

  handleMouseEvent(e: XMouseEvent): void {
    if (e.t === XMouseEventType.Down) {
      const clickedPlanet = this.gameState.planets.find(
        (p) => p.position.distance(e.s) < p.radius
      );
    }
  }

  handleKeyEvent(e: XKeyEvent): void {
      
  }

  gameStep(): void {
    if (!this.gameRunner) return;
    if (this.gameRunner.forwardModel.isTerminal()) {
      console.log(this.gameRunner.forwardModel.statusString());
      this.gameRunner.newGame();
    }
    this.gameState = this.gameRunner.stepGame().state;
  }

  drawPlanets(xg: XGraphics): void {
    for (const planet of this.gameState.planets) {
      const color = this.colors.getColor(planet.owner);
      const size = 2 * planet.radius;
      const circle = new XEllipse(
        planet.position,
        size,
        size,
        new XStyle()
      );
      xg.draw(circle);
      if (!this.showInfoFor.has(planet.owner)) continue;
      const text = new XText(
        `${Math.floor(planet.nShips)}`,
        planet.position,
        new TStyle({fg: this.colors.text,})
      );
      xg.draw(text);
    }
  }

  drawTransporter(xg: XGraphics, t: Transporter): void {
    const scale = 8.0;
    const points = [
      new Vec2d(-2, 2),
      new Vec2d(0, 0),
      new Vec2d(-2, -2),
      new Vec2d(2, 0),
    ].map((p) => p.scale(scale));
    const transporterStyle = new XStyle({fg: this.colors.getColor(t.owner), fill: true});
    const poly = new XPoly(t.s, points, transporterStyle, undefined, true);
    poly.rotation = t.v.angle();
    xg.draw(poly);

    if (!this.showInfoFor.has(t.owner)) return;

    const text = new XText(
      `${Math.floor(t.nShips)}`,
      t.s,
      new TStyle({fg: this.colors.text}),
    );
    xg.draw(text);
  }

  drawTransporters(xg: XGraphics): void {
    for (const p of this.gameState.planets) {
      if (p.transporter) this.drawTransporter(xg, p.transporter);
    }
  }

  drawBackground(xg: XGraphics): void {
    const centre = new Vec2d(this.width / 2, this.height / 2);
    const rect = new XRect(centre, this.width, this.height);
    rect.dStyle = new XStyle();
    xg.draw(rect);
  }

  drawStatus(xg: XGraphics): void {
    if (!this.gameRunner) return;
    const text = new XText(
      `Game status: ${this.gameRunner.forwardModel.statusString()}`,
      new Vec2d(this.width / 2, 20),
      new TStyle()
    );
    xg.draw(text);
  }

//   handleKeyEvent(e: XKeyEvent): void {
//     if (e.t !== XKeyEventType.Pressed) return;
//     console.log("Key event:", e);
//     if (e.keyCode === " ".charCodeAt(0)) this.paused = !this.paused;
//     if (e.keyCode === "S".charCodeAt(0)) AppLauncher.globFrameRate /= 2;
//     if (e.keyCode === "F".charCodeAt(0)) {
//       AppLauncher.globFrameRate = Math.min(AppLauncher.globFrameRate * 2, 100);
//     }
//     console.log("Frame rate:", AppLauncher.globFrameRate);
//   }
}
