import * as css from "./grid.module.css";
import { brightnessPercentMin, GridNode } from "./gridNode";
import { GridShockwave } from "./gridShockwave";

// Grid
const gridElement = document.querySelector(".grid")! as HTMLElement;
gridElement.classList.add(css.grid);

// Loop
let currentNodes: GridNode[] = [];
let currentShockwaves: GridShockwave[] = [];
const tickInterval = 0;
const noiseInterval = 20;
const hotspotInterval = 2000;

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
    shuffleHotspots();
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
        3,
        500
      )
    );
  });

  gridElement.addEventListener("mousemove", (event) => {
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
  });
}

export function updateGridNodes() {
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

  gridElement.style.gridTemplateColumns = `repeat(${hNodeCount}, 1fr)`;
  gridElement.style.gridTemplateRows = `repeat(${vNodeCount}, 1fr)`;
  gridElement.style.gap = `${nodeGap}px`;
  gridElement.style.padding = `${nodeGap}px`;

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
    let deltaTime = currentTime - prevTime;
    prevTime = currentTime;

    // Loop pauses if tabbed out, causing deltaTime to grow large on next tick. Ignore those deltaTimes.
    if (deltaTime > 100) deltaTime = 1;

    sinceLastTick += deltaTime;
    sinceLastNoiseChange += deltaTime;
    sinceLastNoiseHotspotsChange += deltaTime;

    // Update grid nodes and shockwaves
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

    // Update noise values
    if (sinceLastNoiseChange > noiseInterval) {
      updateNoise(sinceLastNoiseChange);
      sinceLastNoiseChange = 0;
    }

    // Shuffle noise hotspots
    if (sinceLastNoiseHotspotsChange > hotspotInterval) {
      shuffleHotspots();
      sinceLastNoiseHotspotsChange = 0;
    }

    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
}

/**
 * Updates the brightness velocity values of all nodes to produce semi-random background noise
 */
export function updateNoise(deltaTime: number) {
  deltaTime /= 1000;

  for (const [index, gridNode] of currentNodes.entries()) {
    let velocityDelta;

    // Correct noise over/undershoots and normalize brightness again over time
    if (gridNode.brightnessPercent >= maxDesiredNoiseBrightness) {
      const overshoot = gridNode.brightnessPercent - minDesiredNoiseBrightness;
      velocityDelta = Math.random() - 1;
      // Correction speed exponentially grows with amount of overshoot
      velocityDelta *= 0.05 * Math.pow(Math.max(1, overshoot), 2);
    } else if (gridNode.brightnessPercent <= minDesiredNoiseBrightness) {
      // If at or below min brightness and has velocity to go even lower, quickly slow down
      if (gridNode.velocity < 0) gridNode.velocity /= 1.1;
      const undershoot = maxDesiredNoiseBrightness - gridNode.brightnessPercent;
      velocityDelta = Math.random();
      velocityDelta *= 0.3 * Math.max(1, undershoot);
    } else {
      // If inside desired noise brightness range, randomize brightness according to hotspots
      const noiseStrength = getNoiseStrengthForPosition(gridNode.x, gridNode.y);
      velocityDelta = Math.random() * noiseStrength * 2 - 1;
      velocityDelta *= 0.7;
    }

    velocityDelta *= deltaTime;
    gridNode.addVelocity(velocityDelta);
  }
}

/**
 * Distributes a couple of noise hotspots across the screen
 */
function shuffleHotspots() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const hotspotCount = Math.floor((width * height) / 200000);

  noiseHotspots = [];
  for (let i = 0; i < hotspotCount; i++) {
    noiseHotspots.push({
      x: Math.random() * width,
      y: Math.random() * height,
    });
  }

  noiseHotspotsInfluenceDistance = Math.floor((width * height) / 1500);
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
