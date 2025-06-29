// src/planetwars/core/GameStateFactory.ts
import { GameParams } from "./GameParams";
import { GameState } from "./GameState";
import { Planet, Player } from "./GameState";
import { Vec2d } from "../../util/Vec2d";

export class GameStateFactory {
    constructor(public params: GameParams) {}

    makeRandomPlanet(params: GameParams, owner: Player): Planet {
        const x = Math.random() * (params.width / 2);
        const y = Math.random() * params.height;
        const numShips = Math.random() * (params.maxInitialShipsPerPlanet - params.minInitialShipsPerPlanet) + params.minInitialShipsPerPlanet;
        const growthRate = Math.random() * (params.maxGrowthRate - params.minGrowthRate) + params.minGrowthRate;
        const radius = growthRate * params.growthToRadiusFactor;
        return new Planet(owner, numShips, new Vec2d(x, y), growthRate, radius);
    }

    canAdd(planets: Planet[], candidate: Planet, radialSeparation: number): boolean {
        const edgeSep = this.params.edgeSeparation;
        const left = candidate.position.x - candidate.radius;
        const right = candidate.position.x + candidate.radius;
        const top = candidate.position.y - candidate.radius;
        const bottom = candidate.position.y + candidate.radius;

        if (left < edgeSep || right > (this.params.width / 2) - edgeSep) return false;
        if (top < edgeSep || bottom > this.params.height - edgeSep) return false;

        for (const planet of planets) {
            const dist = planet.position.distance(candidate.position);
            const otherRadius = planet.growthRate * this.params.growthToRadiusFactor;
            if (dist < radialSeparation * (otherRadius + candidate.radius)) return false;
        }

        return true;
    }

    createGame(): GameState {
        const planets: Planet[] = [];

        const nNeutral = Math.floor((this.params.numPlanets * this.params.initialNeutralRatio) / 2);
        while (planets.length < this.params.numPlanets / 2) {
            const owner = planets.length < nNeutral ? Player.Neutral : Player.Player1;
            const candidate = this.makeRandomPlanet(this.params, owner);
            if (this.canAdd(planets, candidate, this.params.radialSeparation)) {
                planets.push(candidate);
            }
        }

        const reflectedPlanets: Planet[] = [];
        for (const planet of planets) {
            const reflected = planet.clone();
            reflected.position = new Vec2d(
                this.params.width - planet.position.x,
                this.params.height - planet.position.y
            );
            if (planet.owner === Player.Player1) {
                reflected.owner = Player.Player2;
            }
            reflectedPlanets.push(reflected);
        }

        planets.push(...reflectedPlanets);

        planets.forEach((planet, i) => {
            planet.id = i;
        });

        return new GameState(planets);
    }
}
