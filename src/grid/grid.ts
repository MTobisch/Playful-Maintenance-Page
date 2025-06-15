import * as css from "./grid.module.css";
import { GridNodesController } from "./nodes/gridNodesController";
import { GridNoiseController } from "./noise/gridNoiseController";
import { GridShockwavesController } from "./shockwaves/gridShockwavesController";
import { iTickable } from "./iTickable";

// Initialize canvas
const gridCanvas = document.querySelector(".grid")! as HTMLCanvasElement;
gridCanvas.classList.add(css.grid);
gridCanvas.width = window.innerWidth;
gridCanvas.height = window.innerHeight;

window.addEventListener("resize", (event) => {
  gridCanvas.width = window.innerWidth;
  gridCanvas.height = window.innerHeight;
});

const ctx = gridCanvas.getContext("2d")!;

const components: iTickable[] = [
  new GridNodesController(gridCanvas, ctx),
  new GridShockwavesController(gridCanvas),
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
