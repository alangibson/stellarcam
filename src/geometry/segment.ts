import { Boundary } from "./boundary";
import { DirectionEnum, GeometryTypeEnum, MirrorEnum } from "./geometry.enum";
import { Point } from "./point";
import { segmentDirection } from "./segment.function";
import { Shape } from "./shape";

/**
 * A line anchored at two points
 */
export class Segment extends Shape {

    type: GeometryTypeEnum = GeometryTypeEnum.SEGMENT;
    
    start_point: Point;
    end_point: Point;

    bounding_box: Boundary;

    constructor(start_point: Point, end_point: Point) {
        super();
        this.start_point = start_point;
        this.end_point = end_point;
    }

    get boundary(): Boundary {
        if (!this.bounding_box) {
            this.bounding_box = new Boundary(this.start_point, this.end_point);
        }
        return this.bounding_box;
    }

    get direction(): DirectionEnum {
        return segmentDirection(this.start_point, this.end_point);
    }

    set direction(direction: DirectionEnum) {
        if (direction == this.direction)
            return;
        // Change direction
        this.reverse();
    }

    get command(): string {
        return `M ${this.start_point.x},${this.start_point.y} L ${this.end_point.x},${this.end_point.y}`;
    }

    private bust() {
        this.bounding_box = null;
    }

    // Unique identifier for each segment (handles both directions)
    toString() {
        return `${this.start_point.toString()}-${this.end_point.toString()}`;
    }

    // Reverse identifier to handle bidirectional check
    reverseToString() {
        return `${this.end_point.toString()}-${this.start_point.toString()}`;
    }

    reversed: boolean = false;

    reverse() {
        if (this.reversed) {
            console.log('already reversed');
            // return;
        }


        this.bust();
        const start_point = this.start_point;
        this.start_point = this.end_point;
        this.end_point = start_point;

        this.reversed = true;
    }

    mirror(mirror: MirrorEnum, axisValue: number = 0) {
        this.start_point.mirror(mirror, axisValue);
        this.end_point.mirror(mirror, axisValue);
    }

    translate(dx: number, dy: number) {
        this.start_point.translate(dx, dy);
        this.end_point.translate(dx, dy);
    }

}