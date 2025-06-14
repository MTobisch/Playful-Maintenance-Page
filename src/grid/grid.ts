import * as css from "./grid.module.css";
import { GridNodesController } from "./nodes/gridNodesController";
import { GridNoiseController } from "./noise/gridNoiseController";
import { GridShockwavesController } from "./shockwaves/gridShockwavesController";
import { iTickable } from "./iTickable";

const gridElement = document.querySelector(".grid")! as HTMLElement;
gridElement.classList.add(css.grid);

const components: iTickable[] = [
  new GridNodesController(gridElement),
  new GridShockwavesController(gridElement),
  new GridNoiseController(),
];

export function init() {
  let prevTime = performance.now();

  const animate = (currentTime: number) => {
    let deltaTime = currentTime - prevTime;
    prevTime = currentTime;

    // Loop pauses if tabbed out, causing deltaTime to grow large on next tick. Ignore those deltaTimes.
    if (deltaTime > 100) deltaTime = 1;

    // Call components per tick
    for (const component of components) {
      component.tick(deltaTime);
    }

    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
}
