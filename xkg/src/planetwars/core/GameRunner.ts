import { GameParams } from "./GameParams";
import { GameState, Player } from "./GameState";
import { ForwardModel } from "./ForwardModel";
import { PlanetWarsAgent } from "./AgentInterfaces";
import { GameStateFactory } from "./GameStateFactory";
import { Action } from "./AgentInterfaces";

export class GameRunner {
  gameState: GameState;
  forwardModel: ForwardModel;

  constructor(
    public agent1: PlanetWarsAgent,
    public agent2: PlanetWarsAgent,
    public gameParams: GameParams
  ) {
    this.gameState = new GameStateFactory(gameParams).createGame();
    this.forwardModel = new ForwardModel(this.gameState.deepCopy(), gameParams);
    this.newGame();
  }

  runGame(): ForwardModel {
    this.newGame();
    while (!this.forwardModel.isTerminal()) {
      const actions = new Map<Player, Action>([
        [Player.Player1, this.agent1.getAction(this.forwardModel.state.deepCopy())],
        [Player.Player2, this.agent2.getAction(this.forwardModel.state.deepCopy())],
      ]);
      this.forwardModel.step(actions);
    }
    return this.forwardModel;
  }

  newGame(): void {
    if (this.gameParams.newMapEachRun) {
      this.gameState = new GameStateFactory(this.gameParams).createGame();
    }
    this.forwardModel = new ForwardModel(this.gameState.deepCopy(), this.gameParams);
    this.agent1.prepareToPlayAs(Player.Player1, this.gameParams);
    this.agent2.prepareToPlayAs(Player.Player2, this.gameParams);
  }

  stepGame(): ForwardModel {
    if (this.forwardModel.isTerminal()) {
      return this.forwardModel;
    }
    const actions = new Map<Player, Action>([
      [Player.Player1, this.agent1.getAction(this.forwardModel.state)],
      [Player.Player2, this.agent2.getAction(this.forwardModel.state)],
    ]);
    this.forwardModel.step(actions);
    return this.forwardModel;
  }

  runGames(nGames: number): Map<Player, number> {
    const scores = new Map<Player, number>([
      [Player.Player1, 0],
      [Player.Player2, 0],
      [Player.Neutral, 0],
    ]);

    for (let i = 0; i < nGames; i++) {
      const finalModel = this.runGame();
      const winner = finalModel.getLeader();
      scores.set(winner, (scores.get(winner) ?? 0) + 1);
    }

    return scores;
  }
}
