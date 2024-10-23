import { Point } from "./point";

/**
 * A bounding box
 */
export class Boundary {
    // Bottom-left/min point
    start_point: Point;
    // Top-right/max point
    end_point: Point;

    constructor(start_point: Point, end_point: Point) {
        this.start_point = start_point;
        this.end_point = end_point;
    }

    join(boundary: Boundary) {
        this.start_point.x = Math.min(this.start_point.x, this.end_point.x, boundary.start_point.x, boundary.end_point.x);
        this.start_point.y = Math.min(this.start_point.y, this.end_point.y, boundary.start_point.y, boundary.end_point.y);
        this.end_point.x = Math.min(this.start_point.x, this.end_point.x, boundary.start_point.x, boundary.end_point.x);
        this.end_point.y = Math.min(this.start_point.y, this.end_point.y, boundary.start_point.y, boundary.end_point.y);
    }
}