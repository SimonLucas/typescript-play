// src/main.ts

import './style.css';

import { GameParams } from "./planetwars/core/GameParams";
import { GameStateFactory } from "./planetwars/core/GameStateFactory";
import { PureRandomAgent } from "./planetwars/agents/PureRandomAgent";
import { CarefulRandomAgent } from "./planetwars/agents/CarefulRandomAgent";
import { HumanAgent } from "./planetwars/agents/HumanAgent";
import { HeuristicAgent } from "./planetwars/agents/HeuristicAgent";
// import { SuperGreedyAgent } from "./planetwars/agents/SuperGreedyAgent";
import { GameRunner } from "./planetwars/core/GameRunner";
import { GameView } from "./planetwars/view/GameView";
import { SimpleAppLauncher } from "./gui/SimpleAppLauncher";
import { ControlPanel } from "./gui/ControlPanel";
import { PlanetWarsAgent } from "./planetwars/core/AgentInterfaces";
import { ActionRateLimitedAgent } from "./planetwars/agents/ActionRateLimitedAgent";

// Map from name to agent constructor
const agentMap = {
  "Human Player": () => new HumanAgent(),
  "Heuristic Agent": () => new HeuristicAgent(),
  "Careful Random": () => new CarefulRandomAgent(),
  "Pure Random": () => new PureRandomAgent(),
//   SuperGreedyAgent: () => new SuperGreedyAgent(),
};

const params = new GameParams({
  numPlanets: 20,
  width: 800,
  height: 600,
  maxTicks: 100000,
});
const launcher = new SimpleAppLauncher(undefined as any, params.width, params.height, 60, "Planet Wars");

// Function to resize canvas while maintaining aspect ratio
function resizeCanvas() {
  const canvasWrapper = document.getElementById("canvas-wrapper");
  const controlPanel = document.getElementById("control-panel");

  if (!canvasWrapper || !controlPanel) return;

  const wrapperRect = canvasWrapper.getBoundingClientRect();
  const availableWidth = wrapperRect.width;
  const availableHeight = wrapperRect.height;

  // Calculate size maintaining aspect ratio
  const aspectRatio = params.width / params.height;
  let canvasWidth = availableWidth;
  let canvasHeight = canvasWidth / aspectRatio;

  if (canvasHeight > availableHeight) {
    canvasHeight = availableHeight;
    canvasWidth = canvasHeight * aspectRatio;
  }

  launcher.resizeCanvas(Math.floor(canvasWidth), Math.floor(canvasHeight));
}

// Resize on window resize
window.addEventListener("resize", resizeCanvas);

// Handle fullscreen
const fullscreenBtn = document.getElementById("fullscreen-btn");
const canvasWrapper = document.getElementById("canvas-wrapper");

if (fullscreenBtn && canvasWrapper) {
  fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      canvasWrapper.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  });

  // Update canvas size when entering/exiting fullscreen
  document.addEventListener("fullscreenchange", () => {
    setTimeout(resizeCanvas, 100); // Small delay to ensure layout is updated
  });
}

// Initial resize
resizeCanvas();

launcher.launch();

let aiActionCooldownMs = 500;
let activeRateLimitedAgents: ActionRateLimitedAgent[] = [];
let quickSendEnabled = false;
let activeGameView: GameView | null = null;

function rateLimitComputerAgent(agent: PlanetWarsAgent): PlanetWarsAgent {
  if (agent instanceof HumanAgent) return agent;
  const rateLimitedAgent = new ActionRateLimitedAgent(agent, aiActionCooldownMs);
  activeRateLimitedAgents.push(rateLimitedAgent);
  return rateLimitedAgent;
}

function startNewGame(agent1: PlanetWarsAgent, agent2: PlanetWarsAgent) {
  const gameState = new GameStateFactory(params).createGame();
  activeRateLimitedAgents = [];
  const gameRunner = new GameRunner(
    rateLimitComputerAgent(agent1),
    rateLimitComputerAgent(agent2),
    params,
  );
  const view = new GameView(gameState, params, undefined, gameRunner);
  view.setQuickSendEnabled(quickSendEnabled);
  activeGameView = view;
  const title = `${agent1.getAgentType()} : Planet Wars : ${agent2.getAgentType()}`;

  launcher.setApp(view);
  document.title = title;
}


// First game on load
startNewGame(new HeuristicAgent(), new HumanAgent());

// Add UI controls
new ControlPanel(agentMap, startNewGame, (cooldownMs) => {
  aiActionCooldownMs = cooldownMs;
  for (const agent of activeRateLimitedAgents) agent.setCooldownMs(cooldownMs);
}, aiActionCooldownMs, (enabled) => {
  quickSendEnabled = enabled;
  activeGameView?.setQuickSendEnabled(enabled);
}, quickSendEnabled, (numPlanets) => {
  params.numPlanets = numPlanets;
}, params.numPlanets);
