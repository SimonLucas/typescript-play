import { Action, PlanetWarsAgent } from "../core/AgentInterfaces";
import { GameParams } from "../core/GameParams";
import { GameState, Player } from "../core/GameState";

/** Limits how frequently a computer agent can issue a real action. */
export class ActionRateLimitedAgent implements PlanetWarsAgent {
  private lastActionAt = Number.NEGATIVE_INFINITY;

  constructor(
    private readonly agent: PlanetWarsAgent,
    private cooldownMs: number,
    private readonly now: () => number = () => Date.now(),
  ) {}

  setCooldownMs(cooldownMs: number): void {
    this.cooldownMs = Math.max(0, cooldownMs);
  }

  getAction(gameState: GameState): Action {
    const currentTime = this.now();
    if (currentTime - this.lastActionAt < this.cooldownMs) {
      return Action.doNothing();
    }

    const action = this.agent.getAction(gameState);
    if (action !== Action.DO_NOTHING) {
      this.lastActionAt = currentTime;
    }
    return action;
  }

  getAgentType(): string {
    return this.agent.getAgentType();
  }

  prepareToPlayAs(player: Player, params: GameParams, opponent?: string): string {
    this.lastActionAt = Number.NEGATIVE_INFINITY;
    return this.agent.prepareToPlayAs(player, params, opponent);
  }

  processGameOver(finalState: GameState): void {
    this.agent.processGameOver?.(finalState);
  }
}
