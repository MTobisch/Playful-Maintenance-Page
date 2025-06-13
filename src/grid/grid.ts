import * as css from "./grid.module.css";
import { GridNode } from "./gridNode";
import { GridShockwave } from "./gridShockwave";

// Grid
const gridElement = document.querySelector(".grid")! as HTMLElement;
gridElement.classList.add(css.grid);

// Loop
let currentNodes: GridNode[] = [];
let currentShockwaves: GridShockwave[] = [];
const tickInterval = 0;
const noiseInterval = 50;
const hotspotInterval = 1000;

// Noise
const minDesiredNoiseBrightness = 1;
const maxDesiredNoiseBrightness = 20;
let noiseHotspots: { x: number; y: number }[] = [];
let noiseHotspotsInfluenceDistance = 0;
shuffleHotspots();

export function init() {
  updateGridNodes();
  handleGridEvents();
  initLoop();

  window.addEventListener("resize", (event) => {
    updateGridNodes();
  });
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
        30,
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
        50
      )
    );
    //}
    mouseOverCounter++;
  });
}

export function updateGridNodes() {
  // Clear grid
  currentNodes.forEach((node) => node.remove());
  currentNodes = [];

  // Calculate nr of nodes for screen resolution
  const nodeWidth = 10;
  const nodeGap = 10;
  const width = document.body.clientWidth;
  const height = document.body.clientHeight;
  const hNodeCount = Math.floor(width / (nodeGap + nodeWidth));
  const vNodeCount = Math.floor(height / (nodeGap + nodeWidth));

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
  let sinceLastTick = 0;
  let sinceLastNoiseChange = 0;
  let sinceLastNoiseHotspotsChange = 0;
  let prevTime = performance.now();

  const animate = (currentTime: number) => {
    const deltaTime = currentTime - prevTime;
    prevTime = currentTime;
    sinceLastTick += deltaTime;
    sinceLastNoiseChange += deltaTime;
    sinceLastNoiseHotspotsChange += deltaTime;

    if (sinceLastTick > tickInterval) {
      sinceLastTick = 0;
      for (const gridNode of currentNodes) {
        gridNode.tick(deltaTime);
      }

      for (const gridShockwave of currentShockwaves) {
        gridShockwave.tick(deltaTime);
        if (gridShockwave.isRemovable()) {
          currentShockwaves = currentShockwaves.filter(
            (shockwave) => shockwave !== gridShockwave
          );
        }
      }
    }

    // Update noise values regularly
    if (sinceLastNoiseChange > noiseInterval) {
      sinceLastNoiseChange = 0;
      updateNoise();
    }

    // Shuffle noise hotspots regularly
    if (sinceLastNoiseHotspotsChange > hotspotInterval) {
      sinceLastNoiseHotspotsChange = 0;
      shuffleHotspots();
    }

    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
}

export function updateNoise() {
  for (const [index, gridNode] of currentNodes.entries()) {
    let velocityDelta;

    // Correct noise over/undershoots and normalize brightness again over time
    if (gridNode.brightnessPercent >= maxDesiredNoiseBrightness) {
      const overshoot = gridNode.brightnessPercent - minDesiredNoiseBrightness;
      velocityDelta = Math.random() - 1;
      velocityDelta *= 1 * Math.min(1, overshoot); // Correction speed is dependant on amount of overshoot
      velocityDelta = velocityDelta - gridNode.velocity;
    } else if (gridNode.brightnessPercent <= minDesiredNoiseBrightness) {
      const undershoot = maxDesiredNoiseBrightness - gridNode.brightnessPercent;
      velocityDelta = Math.random();
      velocityDelta *= 0.1 * Math.min(1, undershoot);
      velocityDelta = velocityDelta - gridNode.velocity;
      // In inside desired noise brightness range, randomize brightness change delate according to hotspots
    } else {
      const noiseStrength = getNoiseStrengthForPosition(gridNode.x, gridNode.y);
      velocityDelta = Math.random() * noiseStrength * 2 - 1;
      velocityDelta *= 0.1;
    }

    gridNode.addVelocity(velocityDelta);
  }
}

function shuffleHotspots() {
  const hotspotCount = Math.floor(
    (document.body.clientWidth * document.body.clientHeight) / 200000
  );
  const totalWidth = document.body.clientWidth;
  const totalHeight = document.body.clientHeight;

  noiseHotspots = [];
  for (let i = 0; i < hotspotCount; i++) {
    noiseHotspots.push({
      x: Math.random() * totalWidth,
      y: Math.random() * totalHeight,
    });
  }

  noiseHotspotsInfluenceDistance = Math.floor(
    (document.body.clientWidth * document.body.clientHeight) / 1500
  );
}

/**
 * Returns an integer between 0 and 1 indicating the noise brightness at the position according to the current hotspots
 */
function getNoiseStrengthForPosition(x: number, y: number): number {
  let closestDistance = Number.MAX_VALUE;

  for (const hotspot of noiseHotspots) {
    const distance = Math.sqrt(
      Math.pow(x - hotspot.x, 2) + Math.pow(y - hotspot.y, 2)
    );
    if (distance < closestDistance) {
      closestDistance = distance;
    }
  }

  const normalizedDistance = Math.abs(
    1 - Math.min(closestDistance / noiseHotspotsInfluenceDistance, 1)
  );
  return normalizedDistance;
}
