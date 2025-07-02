// src/main.ts
import { GameParams } from "./planetwars/core/GameParams";
import { GameStateFactory } from "./planetwars/core/GameStateFactory";
import { PureRandomAgent } from "./planetwars/agents/PureRandomAgent";
import { CarefulRandomAgent } from "./planetwars/agents/CarefulRandomAgent";
// import { SuperGreedyAgent } from "./planetwars/agents/SuperGreedyAgent";
import { GameRunner } from "./planetwars/core/GameRunner";
import { GameView } from "./planetwars/view/GameView";
import { SimpleAppLauncher } from "./gui/SimpleAppLauncher";
import { ControlPanel } from "./gui/ControlPanel";

// Map from name to agent constructor
const agentMap = {
  PureRandomAgent: () => new PureRandomAgent(),
  CarefulRandomAgent: () => new CarefulRandomAgent(),
//   SuperGreedyAgent: () => new SuperGreedyAgent(),
};

const params = new GameParams({ numPlanets: 100, width: 800, height: 600 });
const launcher = new SimpleAppLauncher(undefined as any, params.width, params.height, 60, "Planet Wars");
launcher.launch();

function startNewGame(agent1: any, agent2: any) {
  const gameState = new GameStateFactory(params).createGame();
  const gameRunner = new GameRunner(agent1, agent2, params);
  const view = new GameView(gameState, params, undefined, gameRunner);
  const title = `${agent1.getAgentType()} : Planet Wars : ${agent2.getAgentType()}`;

  launcher.setApp(view);
  document.title = title;
}


// First game on load
startNewGame(new CarefulRandomAgent(), new PureRandomAgent());

// Add UI controls
new ControlPanel(agentMap, startNewGame);
