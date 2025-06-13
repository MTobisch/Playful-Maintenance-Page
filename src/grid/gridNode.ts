import * as css from "./gridNode.module.css";

const brightnessPercentMin = 1;
const brightnessPercentMax = 100;
const brightnessInertia = 10; // The higher, the slower brighness changes
const velocityMin = -10;
const velocityMax = 10;

export class GridNode {
  element: HTMLElement;
  hovered = false;
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

    this.initListeners();
    this.updateBrightness();
  }

  remove() {
    this.element.remove();
  }

  initListeners() {
    this.element.addEventListener("mouseenter", (event) => {
      this.hovered = true;
      this.brightnessPercent = 100;
      this.updateBrightness();
    });

    this.element.addEventListener("mouseleave", (event) => {
      this.hovered = false;
    });
  }

  tick(deltaTime: number) {
    if (this.index === 100) {
      console.log(
        Math.floor(this.brightnessPercent * 10000) / 10000,
        Math.floor(this.velocity * 10000) / 10000
      );
    }

    if (!this.hovered) {
      // Update brightnessPercent
      this.brightnessPercent += (deltaTime * this.velocity) / brightnessInertia;
      if (this.brightnessPercent > brightnessPercentMax) {
        this.brightnessPercent = brightnessPercentMax;
      }
      if (this.brightnessPercent < brightnessPercentMin) {
        this.brightnessPercent = brightnessPercentMin;
      }
      this.updateBrightness();
    }
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
