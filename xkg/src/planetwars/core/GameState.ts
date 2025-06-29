// src/planetwars/core/GameState.ts
import { Vec2d } from "../../util/Vec2d";

// Player enum with opponent lookup
export enum Player {
    Player1 = "Player1",
    Player2 = "Player2",
    Neutral = "Neutral"
}

export function opponent(p: Player): Player {
    switch (p) {
        case Player.Player1: return Player.Player2;
        case Player.Player2: return Player.Player1;
        default:
            throw new Error("Neutral does not have an opponent");
    }
}

// Transporter class
export class Transporter {
    constructor(
        public s: Vec2d,
        public v: Vec2d,
        public owner: Player,
        public sourceIndex: number,
        public destinationIndex: number,
        public nShips: number
    ) {}

    clone(): Transporter {
        return new Transporter(
            this.s, this.v,
            this.owner,
            this.sourceIndex,
            this.destinationIndex,
            this.nShips
        );
    }
}

// Planet class
export class Planet {
    constructor(
        public owner: Player,
        public nShips: number,
        public position: Vec2d,
        public growthRate: number,
        public radius: number,
        public transporter: Transporter | null = null,
        public id: number = -1
    ) {}

    clone(): Planet {
        return new Planet(
            this.owner,
            this.nShips,
            new Vec2d(this.position.x, this.position.y),
            this.growthRate,
            this.radius,
            this.transporter ? this.transporter.clone() : null,
            this.id
        );
    }
}

// GameState class
export class GameState {
    constructor(
        public planets: Planet[],
        public gameTick: number = 0
    ) {}

    deepCopy(): GameState {
        const copiedPlanets = this.planets.map(p => p.clone());
        return new GameState(copiedPlanets, this.gameTick);
    }
}
