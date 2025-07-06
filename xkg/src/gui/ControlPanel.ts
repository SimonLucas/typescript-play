// src/gui/ControlPanel.ts
export type AgentFactory = () => any;

export class ControlPanel {
  private container: HTMLDivElement;
  private player1Select: HTMLSelectElement;
  private player2Select: HTMLSelectElement;
  private startButton: HTMLButtonElement;

  constructor(
    private agentOptions: Record<string, AgentFactory>,
    private onStart: (agent1: any, agent2: any) => void
  ) {
    this.container = document.createElement("div");
    this.container.style.position = "absolute";
    this.container.style.bottom = "10px";
    this.container.style.left = "10px";
    this.container.style.backgroundColor = "#ffffffcc";
    this.container.style.padding = "10px";
    this.container.style.borderRadius = "8px";
    this.container.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
    this.container.style.fontFamily = "sans-serif";
    this.container.style.zIndex = "10";

    const label1 = document.createElement("label");
    label1.textContent = "Player 1:";
    this.player1Select = this.createAgentSelect();
    this.container.appendChild(label1);
    this.container.appendChild(this.player1Select);

    const label2 = document.createElement("label");
    label2.textContent = " Player 2:";
    this.player2Select = this.createAgentSelect();
    this.container.appendChild(label2);
    this.container.appendChild(this.player2Select);

    this.startButton = document.createElement("button");
    this.startButton.textContent = "Start New Game";
    this.startButton.style.marginLeft = "10px";
    this.startButton.onclick = () => this.handleStart();
    this.container.appendChild(this.startButton);

    document.body.appendChild(this.container);
  }

  private createAgentSelect(): HTMLSelectElement {
    const select = document.createElement("select");
    select.style.margin = "0 10px";
    const randomOption = document.createElement("option");
    randomOption.value = "random";
    randomOption.text = "Random";
    select.appendChild(randomOption);

    for (const name of Object.keys(this.agentOptions)) {
      const option = document.createElement("option");
      option.value = name;
      option.text = name;
      select.appendChild(option);
    }

    return select;
  }

  private getAgent(select: HTMLSelectElement): any {
    const val = select.value;
    if (val === "random") {
      const names = Object.keys(this.agentOptions);
      const randName = names[Math.floor(Math.random() * names.length)];
      return this.agentOptions[randName]();
    }
    return this.agentOptions[val]();
  }

  private handleStart(): void {
    const agent1 = this.getAgent(this.player1Select);
    const agent2 = this.getAgent(this.player2Select);
    this.onStart(agent1, agent2);
  }
}
