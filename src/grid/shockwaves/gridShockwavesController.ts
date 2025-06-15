import { currentNodes } from "../nodes/gridNodesController";
import { GridShockwave } from "./gridShockwave";
import { iTickable } from "../iTickable";
import { createSumTrigger, SumTrigger } from "../utils";

export let currentShockwaves: GridShockwave[] = [];
let trigger: SumTrigger;

export class GridShockwavesController implements iTickable {
  constructor(public gridCanvas: HTMLCanvasElement) {
    gridCanvas.addEventListener("click", (event) => {
      this.createShockwave(event.clientX, event.clientY, 3, 500);
    });

    // Mousemove event interval speed can be spotty and make the shockwave trail seem laggy.
    // If time between mousemove events exceeds n time, interpolate more shockwaves in between.
    let prev = performance.now();
    let prevEvent: MouseEvent;
    gridCanvas.addEventListener("mousemove", (event) => {
      const now = performance.now();
      const interval = now - prev;
      if (interval > 5 && interval < 20 && prevEvent) {
        const extraShockwaveCount = Math.floor(interval / 5);
        const segmentX =
          (event.clientX - prevEvent.clientX) / (1 + extraShockwaveCount);
        const segmentY =
          (event.clientY - prevEvent.clientY) / (1 + extraShockwaveCount);
        for (let i = 0; i++; i < extraShockwaveCount) {
          this.createShockwave(
            prevEvent.clientX + segmentX * (i + 1),
            prevEvent.clientY + segmentY * (i + 1),
            1,
            50
          );
        }
      }
      this.createShockwave(event.clientX, event.clientY, 1, 50);

      prev = now;
      prevEvent = event;
    });

    trigger = createSumTrigger(20, (deltaSum) => {
      for (const gridShockwave of currentShockwaves) {
        gridShockwave.tick(deltaSum);
        if (gridShockwave.isRemovable()) {
          currentShockwaves = currentShockwaves.filter(
            (shockwave) => shockwave !== gridShockwave
          );
        }
      }
    });
  }

  tick(deltaTime: number): void {
    trigger.add(deltaTime);
  }

  createShockwave(x: number, y: number, strength: number, radius: number) {
    currentShockwaves.push(
      new GridShockwave({ x, y }, currentNodes, strength, radius)
    );
  }
}
