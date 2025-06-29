// src/main.ts

import { GameParams } from "./planetwars/core/GameParams";
import { GameStateFactory } from "./planetwars/core/GameStateFactory";
import { PureRandomAgent } from "./planetwars/agents/PureRandomAgent";
import { CarefulRandomAgent } from "./planetwars/agents/CarefulRandomAgent";
import { GameRunner } from "./planetwars/core/GameRunner";
import { GameView } from "./planetwars/view/GameView";
import { AppLauncher } from "./gui/AppLauncher";

// Set up game parameters
const params = new GameParams({numPlanets: 20}); 

// Create initial game state
const gameState = new GameStateFactory(params).createGame();

// Create agents
const agent1 = new CarefulRandomAgent();
const agent2 = new PureRandomAgent();

// Create game runner
const gameRunner = new GameRunner(agent1, agent2, params);

// Create the GameView app
const view = new GameView(gameState, params, undefined, gameRunner);

// Launch the app
const title = `${agent1.getAgentType()} : Planet Wars : ${agent2.getAgentType()}`;
const launcher = new AppLauncher(view, params.width, params.height, 60, title);
launcher.launch();
