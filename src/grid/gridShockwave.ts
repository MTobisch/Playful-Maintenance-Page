import { GridNode } from "./gridNode";
import * as css from "./gridNode.module.css";

export class GridShockwave {
  radius: number = 0;
  speed: number = 0.8;
  touchedNodeIndexes: Set<number> = new Set();

  constructor(
    public center: { x: number; y: number },
    public gridNodes: GridNode[],
    public strength: number,
    public maxRadius: number
  ) {}

  tick(deltaTime: number) {
    if (this.radius > this.maxRadius) return;
    this.radius += deltaTime * this.speed;
    console.log("impact", this.center, this.radius);

    for (const gridNode of this.gridNodes) {
      if (
        !this.touchedNodeIndexes.has(gridNode.index) &&
        this.pointInCircle(gridNode.x, gridNode.y)
      ) {
        this.touchedNodeIndexes.add(gridNode.index);
        const completeness = this.radius / this.maxRadius;
        gridNode.addVelocity(
          this.strength * (0.8 + Math.abs(1 - completeness / 5))
        );
      }
    }
  }

  pointInCircle(px: number, py: number): boolean {
    const dx = px - this.center.x;
    const dy = py - this.center.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }
}
