import { DirectionEnum, MirrorEnum } from "../geometry.enum";
import { Rectangle } from "../rectangle/rectangle";
import { circleBoundingBox, circlePath, rotateCircle } from "./circle.function";
import { GeometryTypeEnum, OriginEnum } from "../geometry.enum";
import { Point, PointProperties } from "../point/point";
import { Shape } from "../shape";

export interface CircleProperties {
    center: PointProperties;
    radius: number;
}

export class Circle extends Shape {

    type: GeometryTypeEnum = GeometryTypeEnum.CIRCLE;

    center: Point;
    radius: number;

    bounding_box: Rectangle;
    private _direction: DirectionEnum = DirectionEnum.CW;

    constructor({ center, radius }: CircleProperties) {
        super();
        this.center = new Point(center);
        this.radius = radius;
    }

    get boundary(): Rectangle {
        if (! this.bounding_box) {
            const { bottomLeft, topRight } = circleBoundingBox(this.center, this.radius);
            const boundary = new Rectangle(bottomLeft, topRight);
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

    rotate(center: PointProperties, angle: number) {
        const circledef: CircleProperties = rotateCircle(this.center.x, this.center.y, this.radius, center.x, center.y, angle);
        this.center = new Point(circledef.center);
    }

    mirror(mirror: MirrorEnum, axisValue: number = 0) {
        // TODO mirror center point
        this.center.mirror(mirror, axisValue);
    }

    translate(dx: number, dy: number) {
        this.center.translate(dx, dy);
    }

}