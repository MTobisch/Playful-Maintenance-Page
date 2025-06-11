import * as css from "./gridNode.module.css";

export class GridNode {
  element: HTMLElement;
  hovered: boolean = false;
  // Brightness
  brightnessPercentMin = 2;
  brightnessPercentMax = 15;
  brightnessPercent = this.brightnessPercentMin;
  brightnessInertia = 30; // The higher, the slower brighness changes
  // Velocity
  velocityMin = -1;
  velocityMax = 1;
  velocity: number = this.velocityMin;
  velocityDecay = -0.001;

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
      console.log(this.velocity, this.brightnessPercent);
    }

    if (!this.hovered) {
      // Update brightnessPercent
      this.brightnessPercent +=
        (deltaTime * this.velocity) / this.brightnessInertia;
      if (this.brightnessPercent > this.brightnessPercentMax)
        this.brightnessPercent = this.brightnessPercentMax;
      if (this.brightnessPercent < this.brightnessPercentMin)
        this.brightnessPercent = this.brightnessPercentMin;
      this.updateBrightness();

      // Decrease velocity over time
      this.addVelocity(this.velocityDecay * deltaTime);
    }
  }

  updateBrightness() {
    this.element.style.opacity = (this.brightnessPercent / 100).toString();
  }

  addVelocity(value: number) {
    this.velocity += value;
    if (this.velocity > this.velocityMax) this.velocity = this.velocityMax;
    if (this.velocity < this.velocityMin) this.velocity = this.velocityMin;
  }
}
