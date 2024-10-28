import { DirectionEnum, MirrorEnum } from "./geometry.enum";
import { Boundary } from "./boundary";
import { circleBoundingBox, circlePath } from "./circle.function";
import { GeometryTypeEnum, OriginEnum } from "./geometry.enum";
import { Point } from "./point";
import { Shape } from "./shape";

export interface CircleProperties {
    center: Point;
    radius: number;
}

export class Circle extends Shape {

    type: GeometryTypeEnum = GeometryTypeEnum.CIRCLE;
    center: Point;
    radius: number;
    bounding_box: Boundary;

    private _direction: DirectionEnum = DirectionEnum.CW;

    constructor({ center, radius }: CircleProperties) {
        super();
        
        this.center = center;
        this.radius = radius;
    }

    get boundary(): Boundary {
        if (! this.bounding_box) {
            const { bottomLeft, topRight } = circleBoundingBox(this.center, this.radius);
            const boundary = new Boundary(bottomLeft, topRight);
            this.bounding_box = boundary;
        }
        return this.bounding_box;
    }

    // Start point is always top center (ie 0 degrees).
    get start_point(): Point {
        return new Point({
            x: this.center.x,
            y: this.center.y + this.radius
        });
    }

    set start_point(end_point: Point)  {
        // Noop because start point is always top center (ie 0 degrees).
        // TODO implement this because we need it to set optimal start point
    }

    // End point is always top center (ie 0 degrees).
    get end_point(): Point {
        return this.start_point;
    }

    set end_point(end_point: Point)  {
        // Noop because end point is always top center (ie 0 degrees).
        // TODO implement this because we need it to set optimal start point
    }

    get angle_degrees(): number {
        return 360;
    }

    get direction(): DirectionEnum {
        return this._direction;
    }

    set direction(direction: DirectionEnum) {
        this._direction = direction;
    }

    get command(): string {
        let sweep_flag: number;
        if (this.direction == DirectionEnum.CW)
            sweep_flag = 1;
        else
            sweep_flag = 0;
        const large_arc_flag = 0; // large=1, small=0
        return circlePath(this.center, this.radius);
    }

    reverse() {
        // Noop
    }

    mirror(mirror: MirrorEnum, axisValue: number = 0) {
        // TODO mirror center point
        this.center.mirror(mirror, axisValue);
    }

    translate(dx: number, dy: number) {
        this.center.translate(dx, dy);
    }

}