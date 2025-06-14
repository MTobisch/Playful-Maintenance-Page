import { currentNodes } from "../nodes/gridNodesController";
import { GridShockwave } from "./gridShockwave";
import { iTickable } from "../iTickable";
import { createSumTrigger, SumTrigger } from "../utils";

export let currentShockwaves: GridShockwave[] = [];
let trigger: SumTrigger;

export class GridShockwavesController implements iTickable {
  constructor(public gridElement: HTMLElement) {
    gridElement.addEventListener("click", (event) => {
      this.createShockwave(event.clientX, event.clientY, 3, 500);
    });

    gridElement.addEventListener("mousemove", (event) => {
      this.createShockwave(event.clientX, event.clientY, 1, 50);
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
