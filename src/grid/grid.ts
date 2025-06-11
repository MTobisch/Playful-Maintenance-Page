import * as css from "./grid.module.css";
import { GridNode } from "./gridNode";

const currentNodes: GridNode[] = [];

export function initializeGrid() {
  drawGrid();
  initLoop();
}

export function drawGrid() {
  const gridElement = document.querySelector(".grid")! as HTMLElement;
  gridElement.classList.add(css.grid);

  // Clear grid
  currentNodes.forEach((node) => node.remove());
  currentNodes.length = 0;

  // Calculate nr of nodes for screen resolution
  const nodeWidth = 10;
  const nodeGap = 10;
  const width = document.body.clientWidth;
  const height = document.body.clientHeight;
  const hNodeCount = Math.floor(width / (nodeGap + nodeWidth));
  const vNodeCount = Math.floor(height / (nodeGap + nodeWidth));
  const totalNodes = vNodeCount * hNodeCount;

  gridElement.style.gridTemplateColumns = `repeat(${hNodeCount}, 1fr)`;
  gridElement.style.gridTemplateRows = `repeat(${vNodeCount}, 1fr)`;
  gridElement.style.gap = `${nodeGap}px`;
  gridElement.style.padding = `${nodeGap}px`;

  for (let i = 0; i < hNodeCount; i++) {
    for (let j = 0; j < vNodeCount; j++) {
      const gridNode = new GridNode(
        i * hNodeCount + j,
        nodeGap + hNodeCount * (nodeWidth + nodeGap),
        nodeGap + vNodeCount * (nodeWidth + nodeGap),
        nodeWidth
      );
      currentNodes.push(gridNode);
      gridElement.appendChild(gridNode.element);
    }
  }
}

export function initLoop() {
  setInterval(() => {
    for (const gridNode of currentNodes) {
      const delta = Math.random() * 2 - 1;
      gridNode.addVelocity(delta);
    }
  }, 100);

  let prevTime = performance.now();

  const animate = (currentTime: number) => {
    const deltaTime = currentTime - prevTime;
    //if (deltaTime > 10) {
    prevTime = currentTime;

    for (const gridNode of currentNodes) {
      gridNode.tick(deltaTime);
    }
    //}

    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
}
