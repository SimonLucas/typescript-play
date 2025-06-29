// src/agents/CarefulRandomAgent.ts

import { Action } from "../core/AgentInterfaces";
import { PlanetWarsPlayer } from "../core/AgentInterfaces";
import { GameState, Player, opponent } from "../core/GameState";


export class CarefulRandomAgent extends PlanetWarsPlayer {
  constructor() {
    super();
  }

  getAction(gameState: GameState): Action {
    const myPlanets = gameState.planets.filter(
      (p) => p.owner === this.player && p.transporter === null
    );
    if (myPlanets.length === 0) return Action.doNothing();

    const opponentPlanets = gameState.planets.filter(
      (p) => p.owner === opponent(this.player)
    );
    if (opponentPlanets.length === 0) return Action.doNothing();

    const source = myPlanets[Math.floor(Math.random() * myPlanets.length)];
    const target = opponentPlanets[Math.floor(Math.random() * opponentPlanets.length)];
    return new Action(this.player, source.id, target.id, source.nShips / 2);
  }

  getAgentType(): string {
    return "Careful Random Agent";
  }
}
