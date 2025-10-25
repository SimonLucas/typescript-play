// src/agents/HeuristicAgent.ts

import { Action } from "../core/AgentInterfaces";
import { PlanetWarsPlayer } from "../core/AgentInterfaces";
import { GameState, Player, Planet, opponent } from "../core/GameState";

interface PlanetScore {
  planet: Planet;
  score: number;
  requiredShips: number;
}

/**
 * A smarter agent that uses heuristics to make strategic decisions.
 * Considers planet growth rates, distances, ownership, and strategic value.
 */
export class HeuristicAgent extends PlanetWarsPlayer {
  constructor() {
    super();
  }

  getAction(gameState: GameState): Action {
    const myPlanets = gameState.planets.filter(
      (p) => p.owner === this.player && p.transporter === null && p.nShips > 10
    );

    if (myPlanets.length === 0) return Action.doNothing();

    // Find the best source planet (one with most excess ships)
    const bestSource = this.selectBestSource(myPlanets);
    if (!bestSource || bestSource.nShips < 15) return Action.doNothing();

    // Find the best target planet to attack/capture
    const bestTarget = this.selectBestTarget(gameState, bestSource);
    if (!bestTarget) return Action.doNothing();

    // Calculate how many ships to send
    const shipsToSend = this.calculateShipsToSend(bestSource, bestTarget);

    if (shipsToSend < 1) return Action.doNothing();

    return new Action(this.player, bestSource.id, bestTarget.id, shipsToSend);
  }

  /**
   * Select the best source planet - prioritize those with many ships
   */
  private selectBestSource(myPlanets: Planet[]): Planet | null {
    if (myPlanets.length === 0) return null;

    // Sort by number of ships (descending) and growth rate (descending)
    const sorted = myPlanets.sort((a, b) => {
      const aScore = a.nShips + a.growthRate * 10;
      const bScore = b.nShips + b.growthRate * 10;
      return bScore - aScore;
    });

    return sorted[0];
  }

  /**
   * Select the best target using strategic heuristics
   */
  private selectBestTarget(gameState: GameState, source: Planet): Planet | null {
    const targets = gameState.planets.filter(
      (p) => p.owner !== this.player && p !== source
    );

    if (targets.length === 0) return null;

    const scoredTargets: PlanetScore[] = targets.map((target) => ({
      planet: target,
      score: this.evaluateTarget(source, target),
      requiredShips: this.calculateRequiredShips(target),
    }));

    // Filter out targets that require too many ships
    const feasibleTargets = scoredTargets.filter(
      (st) => st.requiredShips < source.nShips * 0.8
    );

    if (feasibleTargets.length === 0) return null;

    // Sort by score (descending) and return the best
    feasibleTargets.sort((a, b) => b.score - a.score);
    return feasibleTargets[0].planet;
  }

  /**
   * Evaluate a target planet's strategic value
   */
  private evaluateTarget(source: Planet, target: Planet): number {
    const distance = source.position.distance(target.position);
    const requiredShips = this.calculateRequiredShips(target);

    // Base score on growth rate (high growth = high value)
    let score = target.growthRate * 100;

    // Bonus for neutral planets (easier to capture)
    if (target.owner === Player.Neutral) {
      score += 50;
    }

    // Bonus for enemy planets (strategic value)
    if (target.owner === opponent(this.player)) {
      score += 30;
    }

    // Penalty for distance (closer is better)
    score -= distance * 0.5;

    // Penalty for required ships (efficiency)
    score -= requiredShips * 0.3;

    // Bonus for high-value targets close to source
    if (distance < 200 && target.growthRate > 3) {
      score += 100;
    }

    return score;
  }

  /**
   * Calculate how many ships are needed to capture a planet
   */
  private calculateRequiredShips(target: Planet): number {
    if (target.owner === Player.Neutral) {
      // For neutral planets, need slightly more than current ships
      return Math.ceil(target.nShips * 1.2) + 5;
    } else {
      // For enemy planets, account for growth during transit
      // Assume transit takes ~20 ticks (rough estimate)
      const estimatedGrowth = target.growthRate * 20;
      return Math.ceil(target.nShips + estimatedGrowth + 10);
    }
  }

  /**
   * Calculate how many ships to send to a target
   */
  private calculateShipsToSend(source: Planet, target: Planet): number {
    const required = this.calculateRequiredShips(target);
    const available = source.nShips;

    // Send required ships, but keep some for defense
    const keepForDefense = Math.max(20, source.growthRate * 5);
    const maxToSend = available - keepForDefense;

    if (maxToSend < required) {
      // Not enough ships available
      return 0;
    }

    // Send required amount plus a small buffer
    return Math.min(Math.ceil(required * 1.1), maxToSend);
  }

  getAgentType(): string {
    return "Heuristic Agent";
  }
}
