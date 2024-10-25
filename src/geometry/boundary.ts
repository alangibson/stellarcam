import { Point } from "./point";

/**
 * A bounding box
 */
export class Boundary {
    // Bottom-left/min point
    min: Point;
    // Top-right/max point
    max: Point;

    constructor(start_point: Point, end_point: Point) {
        this.min = start_point;
        this.max = end_point;
    }

    join(boundary: Boundary) {
        this.min.x = Math.min(this.min.x, this.max.x, boundary.min.x, boundary.max.x);
        this.min.y = Math.min(this.min.y, this.max.y, boundary.min.y, boundary.max.y);
        this.max.x = Math.min(this.min.x, this.max.x, boundary.min.x, boundary.max.x);
        this.max.y = Math.min(this.min.y, this.max.y, boundary.min.y, boundary.max.y);
    }
}