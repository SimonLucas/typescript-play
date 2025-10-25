// src/agents/HumanAgent.ts

import { Action } from "../core/AgentInterfaces";
import { PlanetWarsPlayer } from "../core/AgentInterfaces";
import { GameState } from "../core/GameState";

/**
 * Human player agent that waits for user input.
 * The GameView will set the pendingAction based on mouse interactions.
 */
export class HumanAgent extends PlanetWarsPlayer {
  private pendingAction: Action | null = null;

  constructor() {
    super();
  }

  getAction(gameState: GameState): Action {
    // Return the pending action if available, otherwise do nothing
    if (this.pendingAction) {
      const action = this.pendingAction;
      this.pendingAction = null; // Clear after returning
      return action;
    }
    return Action.doNothing();
  }

  /**
   * Called by GameView when the human player makes a move
   */
  setAction(action: Action): void {
    this.pendingAction = action;
  }

  /**
   * Check if there's a pending action waiting to be processed
   */
  hasPendingAction(): boolean {
    return this.pendingAction !== null;
  }

  getAgentType(): string {
    return "Human Player";
  }
}
