import { Action } from "../core/AgentInterfaces";
import { PlanetWarsPlayer } from "../core/AgentInterfaces";
import { GameState, Player } from "../core/GameState";
import { GameParams } from "../core/GameParams";
import { GameStateFactory } from "../core/GameStateFactory";

export class PureRandomAgent extends PlanetWarsPlayer {
  override getAction(gameState: GameState): Action {
    const source = gameState.planets[Math.floor(Math.random() * gameState.planets.length)];
    const target = gameState.planets[Math.floor(Math.random() * gameState.planets.length)];
    return new Action(this.player, source.id, target.id, source.nShips / 2);
  }

  override getAgentType(): string {
    return "Pure Random Agent";
  }
}

// Optional main test (run via ts-node or embed in browser console log if using UI)

if (import.meta.url === `file://${process.argv[1]}`) {
    const agent = new PureRandomAgent();
    agent.prepareToPlayAs(Player.Player1, new GameParams());    
    const gameState = new GameStateFactory(new GameParams()).createGame();
    const action = agent.getAction(gameState);
    console.log(action);
}

