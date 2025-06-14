import { iTickable } from "../iTickable";
import { GridNode } from "../nodes/gridNode";

export class GridShockwave implements iTickable {
  radius: number = 0;
  speed: number = 0.8;
  touchedNodeIndexes: Set<number> = new Set();
  relevantNodes: GridNode[] = [];

  constructor(
    public center: { x: number; y: number },
    public gridNodes: GridNode[],
    public strength: number,
    public maxRadius: number
  ) {
    // Create a virtual square that simply represents the outer bounds of the shockwave circle at max radius.
    // Then check which nodes fall into that square. These are the only nodes that need to checked for being hit.
    const top = center.y - maxRadius;
    const bottom = center.y + maxRadius;
    const left = center.x - maxRadius;
    const right = center.x + maxRadius;
    this.relevantNodes = gridNodes.filter((node) => {
      return (
        node.x >= left && node.x <= right && node.y > top && node.y < bottom
      );
    });
  }

  isRemovable(): boolean {
    return this.radius > this.maxRadius;
  }

  tick(deltaTime: number) {
    if (this.radius > this.maxRadius) return;

    // Increase shockwave radius on each tick
    this.radius += deltaTime * this.speed;

    // Find new nodes touched by the shockwave
    let touchedNodes: number[] = [];
    for (const [index, gridNode] of this.relevantNodes.entries()) {
      if (this.pointInCircle(gridNode.x, gridNode.y)) {
        touchedNodes.push(gridNode.index);

        // Add velocity to touched node
        const completeness = this.radius / this.maxRadius;
        gridNode.addVelocity(
          this.strength * (0.8 + Math.abs(1 - completeness / 5))
        );
      }
    }

    // Remove touched nodes from nodes to check on next tick
    this.relevantNodes = this.relevantNodes.filter(
      (node) => !touchedNodes.includes(node.index)
    );
  }

  pointInCircle(px: number, py: number): boolean {
    const dx = px - this.center.x;
    const dy = py - this.center.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }
}
