import * as css from "./grid.module.css";
import { GridNode } from "./gridNode";
import { GridShockwave } from "./gridShockwave";

const gridElement = document.querySelector(".grid")! as HTMLElement;
gridElement.classList.add(css.grid);

const currentNodes: GridNode[] = [];
let currentShockwaves: GridShockwave[] = [];
const minDesiredNoiseBrightness = 1;
const maxDesiredNoiseBrightness = 10;

export function initializeGrid() {
  updateGridNodes();
  handleGridEvents();
  initLoop();
}

export function handleGridEvents() {
  gridElement.addEventListener("click", (event) => {
    currentShockwaves.push(
      new GridShockwave(
        {
          x: event.clientX,
          y: event.clientY,
        },
        currentNodes,
        3,
        500
      )
    );
  });

  let mouseOverCounter = 0;
  gridElement.addEventListener("mousemove", (event) => {
    //if (mouseOverCounter > 1) {
    mouseOverCounter = 0;
    currentShockwaves.push(
      new GridShockwave(
        {
          x: event.clientX,
          y: event.clientY,
        },
        currentNodes,
        1,
        80
      )
    );
    //}
    mouseOverCounter++;
  });
}

export function updateGridNodes() {
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

  for (let rowIndex = 0; rowIndex < vNodeCount; rowIndex++) {
    for (let columnIndex = 0; columnIndex < hNodeCount; columnIndex++) {
      const gridNode = new GridNode(
        columnIndex * hNodeCount + rowIndex,
        nodeGap + columnIndex * (nodeWidth + nodeGap),
        nodeGap + rowIndex * (nodeWidth + nodeGap),
        nodeWidth
      );
      gridNode.brightnessPercent = minDesiredNoiseBrightness + 0.5;

      currentNodes.push(gridNode);
      gridElement.appendChild(gridNode.element);
    }
  }
}

export function initLoop() {
  let timeSinceLastTick = 0;
  let timeSinceLastNoiseRandomize = 0;
  let prevTime = performance.now();

  const animate = (currentTime: number) => {
    const deltaTime = currentTime - prevTime;
    prevTime = currentTime;
    timeSinceLastTick += deltaTime;
    timeSinceLastNoiseRandomize += deltaTime;

    //if (timeSinceLastTick > 10) {
    timeSinceLastTick = 0;
    for (const gridNode of currentNodes) {
      gridNode.tick(deltaTime);
    }

    for (const gridShockwave of currentShockwaves) {
      gridShockwave.tick(deltaTime);
      if (gridShockwave.radius > gridShockwave.maxRadius) {
        currentShockwaves = currentShockwaves.filter(
          (shockwave) => shockwave !== gridShockwave
        );
      }
    }
    //}

    // Shuffle noise regularly
    if (timeSinceLastNoiseRandomize > 10) {
      timeSinceLastNoiseRandomize = 0;
      updateNoise();
    }

    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
}

export function updateNoise() {
  for (const gridNode of currentNodes) {
    let velocityDelta;

    // Self-correct node brightness to fall in desired noise range over time
    /*
    if (gridNode.brightnessPercent >= maxDesiredNoiseBrightness) {
      const overshoot = gridNode.brightnessPercent - minDesiredNoiseBrightness;
      const overshootRange = 100 - minDesiredNoiseBrightness;
      const overshootPercent = overshoot / overshootRange;
      const maxCorrectionVelocity = -5;
      const idealVelocityForOvershoot =
        maxCorrectionVelocity * overshootPercent;
      const correctionVelocity = idealVelocityForOvershoot - gridNode.velocity;
      velocityDelta = correctionVelocity * 0.3;
    } else if (gridNode.brightnessPercent <= minDesiredNoiseBrightness) {
      const undershoot = maxDesiredNoiseBrightness - gridNode.brightnessPercent;
      const undershootRange = maxDesiredNoiseBrightness;
      const undershootPercent = undershoot / undershootRange;
      const maxCorrectionVelocity = 5;
      const idealVelocityForUndershoot =
        maxCorrectionVelocity * undershootPercent;
      const correctionVelocity = idealVelocityForUndershoot - gridNode.velocity;
      velocityDelta = correctionVelocity * 0.3;
    } else {
      // Random number between -1 and 1
      velocityDelta = Math.random() * 2 - 1;
      velocityDelta *= 0.1;
    }
      */

    if (gridNode.brightnessPercent >= maxDesiredNoiseBrightness) {
      const overshoot = gridNode.brightnessPercent - minDesiredNoiseBrightness;
      velocityDelta = Math.random() - 1;
      velocityDelta *= 0.03 * overshoot; // Correction speed is dependant on amount of overshoot
    } else if (gridNode.brightnessPercent <= minDesiredNoiseBrightness) {
      const undershoot = maxDesiredNoiseBrightness - gridNode.brightnessPercent;
      velocityDelta = Math.random();
      velocityDelta *= 0.033 * undershoot;
    } else {
      velocityDelta = Math.random() * 2 - 1;
      velocityDelta *= 0.01;
    }

    gridNode.addVelocity(velocityDelta);
  }
}
