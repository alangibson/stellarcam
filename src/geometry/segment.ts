import { Boundary } from "./boundary";
import { DirectionEnum, GeometryTypeEnum, OriginEnum } from "./geometry.enum";
import { Point } from "./point";
import { angleBetweenPoints } from "./point.function";
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
        if (! this.bounding_box) {
            this.bounding_box = new Boundary(this.start_point, this.end_point);
        }
        return this.bounding_box;
    }

    get direction(): DirectionEnum {
        const angle: number = angleBetweenPoints(this.start_point.x, this.start_point.y, this.end_point.x, this.end_point.y);
        if (0 < angle && angle <= 180)
            return DirectionEnum.CW;
        else
            return DirectionEnum.CCW;
    }

    set direction(direction: DirectionEnum) {
        if (direction == this.direction)
            return;
        this.bust();
        // Change direction
        const start_point = this.start_point;
        this.start_point = this.end_point;
        this.end_point = start_point;
    }

    private bust() {
        this.bounding_box = null;
    }

    get command(): string {
        return `M ${this.start_point.x},${this.start_point.y} L ${this.end_point.x},${this.end_point.y}`;
    }

    translate(dx: number, dy: number) {
        this.start_point.translate(dx, dy);
        this.end_point.translate(dx, dy);
    }

}