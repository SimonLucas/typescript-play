// core/AgentInterfaces.ts

import { GameParams } from "./GameParams";
import { GameState, Player } from "./GameState";

// Action definition
export class Action {
  constructor(
    public playerId: Player,
    public sourcePlanetId: number,
    public destinationPlanetId: number,
    public numShips: number
  ) {}

  static readonly DO_NOTHING = new Action(Player.Neutral, -1, -1, 0.0);

  static doNothing(): Action {
    return Action.DO_NOTHING;
  }
}

// Fully observable agent interface
export interface PlanetWarsAgent {
  getAction(gameState: GameState): Action;
  getAgentType(): string;
  prepareToPlayAs(
    player: Player,
    params: GameParams,
    opponent?: string
  ): string;
  processGameOver?(finalState: GameState): void;
}

// Default implementation with state
export abstract class PlanetWarsPlayer implements PlanetWarsAgent {
  protected player: Player = Player.Neutral;
  protected params: GameParams = new GameParams();

  abstract getAction(gameState: GameState): Action;
  abstract getAgentType(): string;

  prepareToPlayAs(
    player: Player,
    params: GameParams,
    opponent: string = PlanetWarsPlayer.DEFAULT_OPPONENT
  ): string {
    this.player = player;
    this.params = params;
    return this.getAgentType();
  }

  processGameOver?(finalState: GameState): void {}

  static readonly DEFAULT_OPPONENT = "Anon";
}