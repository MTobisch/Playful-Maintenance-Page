import { iTickable } from "../iTickable";
import * as css from "./gridNode.module.css";

export const brightnessPercentMin = 1;
export const brightnessPercentMax = 100;
export const brightnessInertia = 10; // The higher, the slower brighness changes
export const velocityMin = -10;
export const velocityMax = 10;

export class GridNode implements iTickable {
  brightnessPercent = brightnessPercentMin;
  velocity = 0;

  constructor(
    public ctx: CanvasRenderingContext2D,
    public index: number,
    public x: number,
    public y: number,
    public width: number
  ) {
    this.tick(0);
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

    // Clear previous rect on each tick
    this.ctx.clearRect(this.x, this.y, this.width, this.width);

    // Draw new rect at current brightness
    this.ctx.fillStyle = `rgba(255, 255, 255)`;
    this.ctx.globalAlpha = this.brightnessPercent / 100;
    this.ctx.fillRect(this.x, this.y, this.width, this.width);
  }

  addVelocity(value: number) {
    this.velocity += value;
    if (this.velocity > velocityMax) this.velocity = velocityMax;
    if (this.velocity < velocityMin) this.velocity = velocityMin;
  }
}
