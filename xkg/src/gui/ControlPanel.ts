// src/gui/ControlPanel.ts
export type AgentFactory = () => any;

export class ControlPanel {
  private container: HTMLDivElement;
  private player1Select: HTMLSelectElement;
  private player2Select: HTMLSelectElement;
  private startButton: HTMLButtonElement;
  private actionRateInput: HTMLInputElement;
  private actionRateValue: HTMLSpanElement;
  private quickSendInput: HTMLInputElement;
  private planetCountSelect: HTMLSelectElement;

  constructor(
    private agentOptions: Record<string, AgentFactory>,
    private onStart: (agent1: any, agent2: any) => void,
    private onActionCooldownChange: (cooldownMs: number) => void,
    initialActionCooldownMs = 500,
    private onQuickSendChange: (enabled: boolean) => void,
    initialQuickSendEnabled = false,
    private onPlanetCountChange: (numPlanets: number) => void,
    initialPlanetCount = 20,
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
    this.player2Select.value = "Human Player";
    this.container.appendChild(label2);
    this.container.appendChild(this.player2Select);

    const rateLabel = document.createElement("label");
    rateLabel.textContent = " AI action rate: ";
    rateLabel.style.marginLeft = "10px";
    this.container.appendChild(rateLabel);

    this.actionRateInput = document.createElement("input");
    this.actionRateInput.type = "range";
    this.actionRateInput.min = "500";
    this.actionRateInput.max = "5000";
    this.actionRateInput.step = "500";
    this.actionRateInput.value = String(initialActionCooldownMs);
    this.actionRateInput.setAttribute("aria-label", "AI action cooldown");
    this.actionRateInput.oninput = () => this.handleActionRateChange();
    this.container.appendChild(this.actionRateInput);

    this.actionRateValue = document.createElement("span");
    this.actionRateValue.style.display = "inline-block";
    this.actionRateValue.style.minWidth = "110px";
    this.actionRateValue.style.marginLeft = "6px";
    this.container.appendChild(this.actionRateValue);
    this.updateActionRateText(initialActionCooldownMs);

    const quickSendLabel = document.createElement("label");
    quickSendLabel.style.marginLeft = "10px";
    quickSendLabel.style.cursor = "pointer";

    this.quickSendInput = document.createElement("input");
    this.quickSendInput.type = "checkbox";
    this.quickSendInput.checked = initialQuickSendEnabled;
    this.quickSendInput.onchange = () => {
      this.onQuickSendChange(this.quickSendInput.checked);
    };
    quickSendLabel.appendChild(this.quickSendInput);
    quickSendLabel.append(" Quick send 50%");
    this.container.appendChild(quickSendLabel);

    const planetCountLabel = document.createElement("label");
    planetCountLabel.textContent = " Planets: ";
    planetCountLabel.style.marginLeft = "10px";
    this.container.appendChild(planetCountLabel);

    this.planetCountSelect = document.createElement("select");
    for (const count of [10, 20, 30, 40, 50]) {
      const option = document.createElement("option");
      option.value = String(count);
      option.text = String(count);
      option.selected = count === initialPlanetCount;
      this.planetCountSelect.appendChild(option);
    }
    this.planetCountSelect.setAttribute("aria-label", "Number of planets");
    this.planetCountSelect.onchange = () => {
      this.onPlanetCountChange(Number(this.planetCountSelect.value));
    };
    this.container.appendChild(this.planetCountSelect);

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

  private handleActionRateChange(): void {
    const cooldownMs = Number(this.actionRateInput.value);
    this.updateActionRateText(cooldownMs);
    this.onActionCooldownChange(cooldownMs);
  }

  private updateActionRateText(cooldownMs: number): void {
    this.actionRateValue.textContent = cooldownMs === 500
      ? "2 actions/sec"
      : `1 every ${(cooldownMs / 1000).toFixed(1)} sec`;
  }
}
