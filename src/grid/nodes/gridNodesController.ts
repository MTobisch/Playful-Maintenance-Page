import { GridNode, brightnessPercentMin } from "./gridNode";
import { minDesiredNoiseBrightness } from "../noise/gridNoiseController";
import { iTickable } from "../iTickable";
import { createSumTrigger, SumTrigger } from "../utils";

export let currentNodes: GridNode[] = [];
let trigger: SumTrigger;

export class GridNodesController implements iTickable {
  constructor(public gridElement: HTMLElement) {
    this.updateGridNodes();

    window.addEventListener("resize", (event) => {
      this.updateGridNodes();
    });

    trigger = createSumTrigger(20, (deltaSum) => {
      for (const gridNode of currentNodes) {
        gridNode.tick(deltaSum);
      }
    });
  }

  tick(deltaTime: number): void {
    trigger.add(deltaTime);
  }

  updateGridNodes() {
    // Clear grid
    currentNodes.forEach((node) => node.remove());
    currentNodes = [];

    // Calculate nr of nodes for screen resolution
    const nodeWidth = 10;
    const nodeGap = 10;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const hNodeCount = Math.floor(width / (nodeGap + nodeWidth));
    const vNodeCount = Math.floor(height / (nodeGap + nodeWidth));

    this.gridElement.style.gridTemplateColumns = `repeat(${hNodeCount}, 1fr)`;
    this.gridElement.style.gridTemplateRows = `repeat(${vNodeCount}, 1fr)`;
    this.gridElement.style.gap = `${nodeGap}px`;
    this.gridElement.style.padding = `${nodeGap}px`;

    for (let rowIndex = 0; rowIndex < vNodeCount; rowIndex++) {
      for (let columnIndex = 0; columnIndex < hNodeCount; columnIndex++) {
        const gridNode = new GridNode(
          rowIndex * hNodeCount + columnIndex,
          nodeGap + columnIndex * (nodeWidth + nodeGap),
          nodeGap + rowIndex * (nodeWidth + nodeGap),
          nodeWidth
        );

        // Set initial brightness at min noise value
        gridNode.brightnessPercent =
          Math.max(minDesiredNoiseBrightness, brightnessPercentMin) + 0.5;

        currentNodes.push(gridNode);
        this.gridElement.appendChild(gridNode.element);
      }
    }
  }
}
