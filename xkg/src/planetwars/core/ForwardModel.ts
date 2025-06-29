// src/planetwars/core/ForwardModel.ts
import { GameState, Planet, Player, Transporter, opponent } from "./GameState";
import { GameParams } from "./GameParams";
import { Action } from "./AgentInterfaces";
import { Vec2d } from "../../util/Vec2d";

export class ForwardModel {
    static nUpdates = 0;
    static nFailedActions = 0;
    static nActions = 0;

    constructor(public state: GameState, public params: GameParams) {}

    step(actions: Map<Player, Action>): void {
        this.applyActions(actions);

        const pending: Map<number, Map<Player, number>> = new Map();
        this.updateTransporters(pending);
        this.updatePlanets(pending);
        ForwardModel.nUpdates++;
        this.state.gameTick++;
    }

    applyActions(actions: Map<Player, Action>) {
        for (const [player, action] of actions.entries()) {
            if (action === Action.DO_NOTHING) continue;
            const source = this.state.planets[action.sourcePlanetId];
            const target = this.state.planets[action.destinationPlanetId];

            if (
                source.transporter === null &&
                source.owner === player &&
                source.nShips >= action.numShips
            ) {
                source.nShips -= action.numShips;
                const s = source.position;
                const t = target.position;
                const v = t.sub(s).normalize().scale(this.params.transporterSpeed);
                const transporter = new Transporter(s.clone(), v, player, action.sourcePlanetId, action.destinationPlanetId, action.numShips);
                source.transporter = transporter;
                ForwardModel.nActions++;
            } else {
                ForwardModel.nFailedActions++;
            }
        }
    }

    isTerminal(): boolean {
        if (this.state.gameTick > this.params.maxTicks) return true;
        return (
            this.state.planets.every(p => p.owner !== Player.Player1) ||
            this.state.planets.every(p => p.owner !== Player.Player2)
        );
    }

    statusString(): string {
        return `Game tick: ${this.state.gameTick}; Player 1: ${this.getShips(Player.Player1).toFixed(0)}; Player 2: ${this.getShips(Player.Player2).toFixed(0)}; Leader: ${this.getLeader()}`;
    }

    getShips(player: Player): number {
        return this.state.planets.filter(p => p.owner === player).reduce((acc, p) => acc + p.nShips, 0);
    }

    getLeader(): Player {
        const s1 = this.getShips(Player.Player1);
        const s2 = this.getShips(Player.Player2);
        if (s1 === s2) return Player.Neutral;
        return s1 > s2 ? Player.Player1 : Player.Player2;
    }

    transporterArrival(dest: Planet, tr: Transporter, pending: Map<number, Map<Player, number>>) {
        if (!pending.has(dest.id)) {
            pending.set(dest.id, new Map<Player, number>([
                [Player.Player1, 0],
                [Player.Player2, 0]
            ]));
        }
        const entry = pending.get(dest.id)!;
        entry.set(tr.owner, (entry.get(tr.owner) || 0) + tr.nShips);
    }

    private updateTransporters(pending: Map<number, Map<Player, number>>) {
        for (const planet of this.state.planets) {
            const tr = planet.transporter;
            if (tr) {
                const dest = this.state.planets[tr.destinationIndex];
                if (tr.s.distance(dest.position) < dest.radius) {
                    this.transporterArrival(dest, tr, pending);
                    planet.transporter = null;
                } else {
                    tr.s = tr.s.add(tr.v);
                }
            }
        }
    }

    private updateNeutralPlanet(planet: Planet, pending?: Map<Player, number>) {
        if (!pending) return;
        const in1 = pending.get(Player.Player1) || 0;
        const in2 = pending.get(Player.Player2) || 0;
        const net = in1 - in2;
        planet.nShips -= Math.abs(net);
        if (planet.nShips < 0) {
            planet.owner = net > 0 ? Player.Player1 : Player.Player2;
            planet.nShips = -planet.nShips;
        }
    }

    private updatePlayerPlanet(planet: Planet, pending?: Map<Player, number>) {
        planet.nShips += planet.growthRate;
        if (!pending) return;
        const own = pending.get(planet.owner) || 0;
        const opp = pending.get(opponent(planet.owner)) || 0;
        planet.nShips += own - opp;
        if (planet.nShips < 0) {
            planet.owner = opponent(planet.owner);
            planet.nShips = -planet.nShips;
        }
    }

    private updatePlanets(pending: Map<number, Map<Player, number>>) {
        for (const planet of this.state.planets) {
            const p = pending.get(planet.id);
            if (planet.owner === Player.Neutral) {
                this.updateNeutralPlanet(planet, p);
            } else {
                this.updatePlayerPlanet(planet, p);
            }
        }
    }
}
