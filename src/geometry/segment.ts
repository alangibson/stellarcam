import { Boundary } from "./boundary";
import { GeometryTypeEnum, OriginEnum } from "./geometry.enum";
import { Point } from "./point";
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

    get command(): string {
        return `M ${this.start_point.x},${this.start_point.y} L ${this.end_point.x},${this.end_point.y}`;
    }

    translate(dx: number, dy: number) {
        this.start_point.translate(dx, dy);
        this.end_point.translate(dx, dy);
    }

    project(coord_origin: OriginEnum, width: number, height: number) {
        this.start_point.project(coord_origin, width, height);
        this.end_point.project(coord_origin, width, height);
    }

}