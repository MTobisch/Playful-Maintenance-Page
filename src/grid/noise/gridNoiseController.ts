import { currentNodes } from "../nodes/gridNodesController";
import { iTickable } from "../iTickable";
import { createSumTrigger, SumTrigger } from "../utils";

export const minDesiredNoiseBrightness = 1;
export const maxDesiredNoiseBrightness = 20;
export let noiseHotspots: { x: number; y: number }[] = [];
export let noiseHotspotsInfluenceDistance = 0;
let noiseTrigger: SumTrigger;
let hotspotTrigger: SumTrigger;

export class GridNoiseController implements iTickable {
  constructor() {
    this.shuffleHotspots();

    window.addEventListener("resize", (event) => {
      this.shuffleHotspots();
    });

    noiseTrigger = createSumTrigger(20, (deltaSum) => {
      this.normalizeNoise(deltaSum);
    });

    hotspotTrigger = createSumTrigger(2000, (deltaSum) => {
      this.shuffleHotspots();
    });
  }

  tick(deltaTime: number): void {
    noiseTrigger.add(deltaTime);
    hotspotTrigger.add(deltaTime);
  }

  /**
   * Corrects the brightness values of all nodes to return to the same kind of semi-random background noise over time
   */
  normalizeNoise(deltaTime: number) {
    deltaTime /= 1000;

    for (const [index, gridNode] of currentNodes.entries()) {
      let velocityDelta;

      // Correct noise over/undershoots and normalize brightness again over time
      if (gridNode.brightnessPercent >= maxDesiredNoiseBrightness) {
        const overshoot =
          gridNode.brightnessPercent - minDesiredNoiseBrightness;
        velocityDelta = Math.random() - 1;
        // Correction speed exponentially grows with amount of overshoot
        velocityDelta *= 0.05 * Math.pow(Math.max(1, overshoot), 2);
      } else if (gridNode.brightnessPercent <= minDesiredNoiseBrightness) {
        // If at or below min brightness and has velocity to go even lower, quickly slow down
        if (gridNode.velocity < 0) gridNode.velocity /= 1.1;
        const undershoot =
          maxDesiredNoiseBrightness - gridNode.brightnessPercent;
        velocityDelta = Math.random();
        velocityDelta *= 0.3 * Math.max(1, undershoot);
      } else {
        // If inside desired noise brightness range, randomize brightness according to hotspots
        const noiseStrength = this.getNoiseStrengthForPosition(
          gridNode.x,
          gridNode.y
        );
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
  shuffleHotspots() {
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
  getNoiseStrengthForPosition(x: number, y: number): number {
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
}
