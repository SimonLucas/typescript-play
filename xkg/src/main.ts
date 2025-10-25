// src/main.ts

import './style.css';

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
