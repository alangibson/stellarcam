import { DirectionEnum, MirrorEnum } from "../geometry.enum";
import { arcBoundingBox, arcDirection, arcPoints, arcMidpoint, mirrorArc, arcAngleAtPoint, rotateArc } from "./arc.function";
import { Rectangle } from "../rectangle/rectangle";
import { GeometryTypeEnum } from "../geometry.enum";
import { Point, PointProperties } from "../point/point";
import { Shape } from "../shape";

export interface ArcProperties {
    center: PointProperties;
    radius: number;
    startAngle: number;
    endAngle: number;
}

export class Arc extends Shape {

    type: GeometryTypeEnum = GeometryTypeEnum.ARC;

    center: Point;
    radius: number;
    startAngle: number; // in radians
    endAngle: number; // in radians

    bounding_box: Rectangle;
    private _direction: DirectionEnum;

    constructor({ center, radius, startAngle: start_angle, endAngle: end_angle }: ArcProperties) {
        super();
        this.center = new Point(center);
        this.radius = radius;
        this.startAngle = start_angle;
        this.endAngle = end_angle;

        // Set at creation time because we will render arc backwards
        // if we reverse() then try to determine direction afterward
        // this._direction = arcOrientation(this.start_angle, this.end_angle);
        this._direction = DirectionEnum.CCW;
    }

    get boundary(): Rectangle {
        if (!this.bounding_box) {
            const {
                minX,
                minY,
                maxX,
                maxY,
                width,
                height
            } = arcBoundingBox(this.center.x, this.center.y, this.radius, this.startAngle, this.endAngle);
            this.bounding_box = new Rectangle(new Point({ x: minX, y: minY }), new Point({ x: maxX, y: maxY }));
        }
        return this.bounding_box;
    }

    get direction(): DirectionEnum {
        return this._direction;
    }

    get sweep_degrees(): number {
        const { sweep_angle } = arcDirection(this.start_angle_degrees, this.end_angle_degrees);
        return sweep_angle;
    }

    get start_angle_degrees(): number {
        return this.startAngle * (180 / Math.PI);
    }

    get end_angle_degrees(): number {
        return this.endAngle * (180 / Math.PI);
    }

    get start_point(): Point {
        const { start } = arcPoints(this.center, this.radius, this.startAngle, this.endAngle);
        return start;
    }

    set start_point(start_point: Point) {
        this.startAngle = arcAngleAtPoint(this.center, start_point);
    }

    get middle_point(): Point {
        const { x, y } = arcMidpoint(this.center.x, this.center.y, this.radius, this.startAngle, this.endAngle);
        return new Point({ x, y });
    }

    get end_point(): Point {
        const { end } = arcPoints(this.center, this.radius, this.startAngle, this.endAngle);
        return end;
    }

    set end_point(end_point: Point) {
        this.endAngle = arcAngleAtPoint(this.center, end_point);
    }

    get command(): string {
        let sweep_flag: number;
        if (this.direction == DirectionEnum.CW)
            sweep_flag = 1;
        else
            sweep_flag = 0;
        const large_arc_flag = 0; // large=1, small=0
        return `M ${this.start_point.x},${this.start_point.y} A ${this.radius} ${this.radius} ${this.angle_degrees} ${large_arc_flag} ${sweep_flag} ${this.end_point.x},${this.end_point.y}`
    }

    // Degrees between start angle and end angle
    get angle_degrees(): number {
        return this.end_angle_degrees - this.start_angle_degrees;
    }

    private bust() {
        this.bounding_box = null;
    }
    
    // Does not change internal direction to avoid rendering arc upside down
    reverse() {
        const start_angle = this.startAngle;
        this.startAngle = this.endAngle;
        this.endAngle = start_angle;
        // TODO determine this with arcOrientation.
        this._direction = this._direction == DirectionEnum.CW ? DirectionEnum.CCW : DirectionEnum.CW
    }

    mirror(mirror: MirrorEnum, axisValue: number = 0) {
        const arc = mirrorArc(this.center.x, this.center.y, this.radius, this.startAngle, this.endAngle, this.direction, mirror, axisValue);
        this.center = new Point({x: arc.x, y: arc.y});
        this.radius = arc.radius;
        this.startAngle = arc.startAngle;
        this.endAngle = arc.endAngle;
    }

    translate(dx: number, dy: number) {
        this.center.translate(dx, dy);
    }

    rotate(center: PointProperties, angle: number) {
        const arcdef: ArcProperties = rotateArc(this.center.x, this.center.y, this.radius, this.startAngle, this.endAngle, center.x, center.y, angle);
        this.center = new Point(arcdef.center);
        this.radius = arcdef.radius;
        this.startAngle = arcdef.startAngle;
        this.endAngle = arcdef.endAngle;
    }

    toJSON() {
        return { ...this, start_point: this.start_point, end_point: this.end_point, 
            direction: this.direction, sweep_degrees: this.sweep_degrees };
    }

}