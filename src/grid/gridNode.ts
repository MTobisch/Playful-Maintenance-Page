import * as css from "./gridNode.module.css";

export const brightnessPercentMin = 1;
export const brightnessPercentMax = 100;
export const brightnessInertia = 10; // The higher, the slower brighness changes
export const velocityMin = -10;
export const velocityMax = 10;

export class GridNode {
  element: HTMLElement;
  brightnessPercent = brightnessPercentMin;
  velocity = 0;

  constructor(
    public index: number,
    public x: number,
    public y: number,
    width: number
  ) {
    this.element = document.createElement("div");
    this.element.classList.add(css.node);
    this.element.style.width = `${width}px`;
    this.element.style.height = `${width}px`;

    this.updateBrightness();
  }

  remove() {
    this.element.remove();
  }

  tick(deltaTime: number) {
    // Update brightnessPercent according to current velocity
    this.brightnessPercent += (deltaTime * this.velocity) / brightnessInertia;
    if (this.brightnessPercent > brightnessPercentMax) {
      this.brightnessPercent = brightnessPercentMax;
    }
    if (this.brightnessPercent < brightnessPercentMin) {
      this.brightnessPercent = brightnessPercentMin;
    }
    this.updateBrightness();
  }

  updateBrightness() {
    this.element.style.opacity = (this.brightnessPercent / 100).toString();
  }

  addVelocity(value: number) {
    this.velocity += value;
    if (this.velocity > velocityMax) this.velocity = velocityMax;
    if (this.velocity < velocityMin) this.velocity = velocityMin;
  }
}
