// src/planetwars/view/GameView.ts

import { GameParams } from "../core/GameParams";
import { GameState, Player, Transporter, Planet } from "../core/GameState";
import { GameRunner } from "../core/GameRunner";
import { Action } from "../core/AgentInterfaces";
import { HumanAgent } from "../agents/HumanAgent";
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
  XLine,
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
  private quickSendEnabled = false;
  showInfoFor: Set<Player> = new Set([Player.Player1]);

  // Human player interaction state
  private selectedSourcePlanet: Planet | null = null;
  private mouseDownTime: number = 0;
  private mouseDownPlanet: Planet | null = null;
  private isMouseDown: boolean = false;
  private currentMousePos: Vec2d = new Vec2d(0, 0);
  private scale: number = 1;
  private offsetX: number = 0;
  private offsetY: number = 0;

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

    // Store for mouse coordinate transformation
    this.scale = scale;
    this.offsetX = offsetX;
    this.offsetY = offsetY;

    xg.saveTransform();
    xg.setScale(scale, scale);
    xg.setTranslate(offsetX, offsetY);

    if (!this.paused) this.gameStep();

    this.drawBackground(xg);
    this.drawPlanets(xg);
    this.drawTransporters(xg);
    this.drawHumanPlayerUI(xg);
    this.drawStatus(xg);

    xg.restoreTransform();
  }

  handleMouseEvent(e: XMouseEvent): void {
    // Transform mouse coordinates to game coordinates
    const gamePos = this.screenToGameCoords(e.s);
    this.currentMousePos = gamePos;

    const clickedPlanet = this.findPlanetAt(gamePos);

    if (e.t === XMouseEventType.Down) {
      this.handleMouseDown(clickedPlanet);
    } else if (e.t === XMouseEventType.Up) {
      this.handleMouseUp(clickedPlanet);
    }
  }

  private screenToGameCoords(screenPos: Vec2d): Vec2d {
    // Inverse of the transformation applied in paint
    return new Vec2d(
      screenPos.x / this.scale - this.offsetX,
      screenPos.y / this.scale - this.offsetY
    );
  }

  private findPlanetAt(pos: Vec2d): Planet | null {
    return this.gameState.planets.find(
      (p) => p.position.distance(pos) < p.radius
    ) || null;
  }

  private handleMouseDown(clickedPlanet: Planet | null): void {
    if (!clickedPlanet) {
      // Clicked on background - clear selection
      this.selectedSourcePlanet = null;
      this.isMouseDown = false;
      return;
    }

    const humanPlayer = this.getHumanPlayer();
    if (!humanPlayer) return;

    // If no source selected, try to select this as source
    if (!this.selectedSourcePlanet) {
      if (clickedPlanet.owner === humanPlayer && !clickedPlanet.transporter) {
        this.selectedSourcePlanet = clickedPlanet;
      }
    } else {
      // Source already selected, this is the destination
      if (clickedPlanet !== this.selectedSourcePlanet) {
        if (this.quickSendEnabled) {
          this.sendShips(clickedPlanet, 0.5);
          this.resetHumanInteraction();
          return;
        }
        this.mouseDownPlanet = clickedPlanet;
        this.mouseDownTime = Date.now();
        this.isMouseDown = true;
      }
    }
  }

  private handleMouseUp(clickedPlanet: Planet | null): void {
    if (!this.isMouseDown || !this.mouseDownPlanet || !this.selectedSourcePlanet) {
      this.isMouseDown = false;
      return;
    }

    // Calculate hold duration and ship percentage
    const holdDuration = Date.now() - this.mouseDownTime;
    const shipPercentage = this.calculateShipPercentage(holdDuration);
    this.sendShips(this.mouseDownPlanet, shipPercentage);

    this.resetHumanInteraction();
  }

  private sendShips(destination: Planet, shipPercentage: number): void {
    if (!this.selectedSourcePlanet) return;
    const humanPlayer = this.getHumanPlayer();
    const humanAgent = this.getHumanAgent();
    if (!humanPlayer || !humanAgent) return;

    const numShips = Math.floor(this.selectedSourcePlanet.nShips * shipPercentage);
    if (numShips <= 0) return;

    humanAgent.setAction(new Action(
      humanPlayer,
      this.selectedSourcePlanet.id,
      destination.id,
      numShips,
    ));
  }

  private resetHumanInteraction(): void {
    this.selectedSourcePlanet = null;
    this.mouseDownPlanet = null;
    this.isMouseDown = false;
  }

  setQuickSendEnabled(enabled: boolean): void {
    this.quickSendEnabled = enabled;
    this.resetHumanInteraction();
  }

  private calculateShipPercentage(holdDuration: number): number {
    // 0-2 seconds maps to 0-100%
    const maxDuration = 2000; // 2 seconds for 100%
    const percentage = Math.min(holdDuration / maxDuration, 1.0);
    return percentage;
  }

  private getHumanPlayer(): Player | null {
    if (!this.gameRunner) return null;
    if (this.gameRunner.agent1 instanceof HumanAgent) return Player.Player1;
    if (this.gameRunner.agent2 instanceof HumanAgent) return Player.Player2;
    return null;
  }

  private getHumanAgent(): HumanAgent | null {
    if (!this.gameRunner) return null;
    if (this.gameRunner.agent1 instanceof HumanAgent) return this.gameRunner.agent1;
    if (this.gameRunner.agent2 instanceof HumanAgent) return this.gameRunner.agent2;
    return null;
  }

  handleKeyEvent(e: XKeyEvent): void {
      
  }

  gameStep(): void {
    if (!this.gameRunner) return;
    if (this.gameRunner.forwardModel.isTerminal()) {
      console.log(this.gameRunner.forwardModel.statusString());
      this.paused = true;
      return;
    }
    this.gameState = this.gameRunner.stepGame().state;
    if (this.gameRunner.forwardModel.isTerminal()) {
      console.log(this.gameRunner.forwardModel.statusString());
      this.paused = true;
    }
  }

  drawPlanets(xg: XGraphics): void {
    for (const planet of this.gameState.planets) {
      const color = this.colors.getColor(planet.owner);
      const size = 2 * planet.radius;
      const circle = new XEllipse(
        planet.position,
        size,
        size,
        new XStyle({fg: color, fill: true, stroke: false,})
      );
      xg.draw(circle);
    //   if (!this.showInfoFor.has(planet.owner)) continue;
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

  drawHumanPlayerUI(xg: XGraphics): void {
    const humanPlayer = this.getHumanPlayer();
    if (!humanPlayer) return;

    // Highlight selected source planet
    if (this.selectedSourcePlanet) {
      const radius = this.selectedSourcePlanet.radius * 1.5;
      const circle = new XEllipse(
        this.selectedSourcePlanet.position,
        radius * 2,
        radius * 2,
        new XStyle({
          fg: XColor.yellow,
          lc: XColor.yellow,
          fill: false,
          stroke: true,
          lineWidth: 3
        })
      );
      xg.draw(circle);

      // Draw line to mouse if holding on destination
      if (this.isMouseDown && this.mouseDownPlanet) {
        const lineStyle = new XStyle({
          lc: XColor.yellow,
          stroke: true,
          lineWidth: 2
        });
        const line = new XLine(
          this.selectedSourcePlanet.position,
          this.mouseDownPlanet.position,
          lineStyle
        );
        xg.draw(line);

        // Show percentage indicator
        const holdDuration = Date.now() - this.mouseDownTime;
        const percentage = this.calculateShipPercentage(holdDuration);
        const numShips = Math.floor(this.selectedSourcePlanet.nShips * percentage);
        const percentText = `${Math.floor(percentage * 100)}% (${numShips} ships)`;

        const midPoint = this.selectedSourcePlanet.position
          .add(this.mouseDownPlanet.position)
          .scale(0.5);

        const text = new XText(
          percentText,
          midPoint,
          new TStyle({fg: XColor.yellow, size: 16})
        );
        xg.draw(text);
      }
    }
  }

  drawStatus(xg: XGraphics): void {
    if (!this.gameRunner) return;
    const gameOver = this.gameRunner.forwardModel.isTerminal();
    const text = new XText(
      `${gameOver ? "Game over" : "Game status"}: ${this.gameRunner.forwardModel.statusString()}`,
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
