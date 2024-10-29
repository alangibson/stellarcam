import { DirectionEnum, MirrorEnum } from "./geometry.enum";
import { arcBoundingBox, arcDirection, arcPoints, projectArc, arcMidpoint, mirrorArc, arcAngleAtPoint, arcOrientation } from "./arc.function";
import { Boundary } from "./boundary";
import { GeometryTypeEnum, OriginEnum } from "./geometry.enum";
import { Point } from "./point";
import { Shape } from "./shape";

export interface ArcProperties {
    center: Point;
    radius: number;
    start_angle: number;
    end_angle: number;
}

export class Arc extends Shape {

    type: GeometryTypeEnum = GeometryTypeEnum.ARC;

    center: Point;
    radius: number;
    start_angle: number; // in radians
    end_angle: number; // in radians

    bounding_box: Boundary;
    private _direction: DirectionEnum;

    constructor({ center, radius, start_angle, end_angle }: ArcProperties) {
        super();

        this.center = center;
        this.radius = radius;
        this.start_angle = start_angle;
        this.end_angle = end_angle;

        // Set at creation time because we will render arc backwards
        // if we reverse() then try to determine direction afterward
        // this._direction = arcOrientation(this.start_angle, this.end_angle);
        this._direction = DirectionEnum.CCW;
    }

    get boundary(): Boundary {
        if (!this.bounding_box) {
            const {
                minX,
                minY,
                maxX,
                maxY,
                width,
                height
            } = arcBoundingBox(this.center.x, this.center.y, this.radius, this.start_angle, this.end_angle);
            this.bounding_box = new Boundary(new Point({ x: minX, y: minY }), new Point({ x: maxX, y: maxY }));
        }
        return this.bounding_box;
    }

    get direction(): DirectionEnum {
        return this._direction;
    }

    // set direction(direction: DirectionEnum) {
    //     if (direction == this.direction)
    //         return;
    //     // Change direction
    //     this.bust();
    //     this.reverse();
    //     // this._direction = this._direction == DirectionEnum.CW ? DirectionEnum.CCW : DirectionEnum.CW;
    // }

    get sweep_degrees(): number {
        const { sweep_angle } = arcDirection(this.start_angle_degrees, this.end_angle_degrees);
        return sweep_angle;
    }

    get start_angle_degrees(): number {
        return this.start_angle * (180 / Math.PI);
    }

    get end_angle_degrees(): number {
        return this.end_angle * (180 / Math.PI);
    }

    get start_point(): Point {
        const { start } = arcPoints(this.center, this.radius, this.start_angle, this.end_angle);
        return start;
    }

    set start_point(start_point: Point) {
        this.start_angle = arcAngleAtPoint(this.center, start_point);
    }

    get middle_point(): Point {
        const { x, y } = arcMidpoint(this.center.x, this.center.y, this.radius, this.start_angle, this.end_angle);
        return new Point({ x, y });
    }

    get end_point(): Point {
        const { end } = arcPoints(this.center, this.radius, this.start_angle, this.end_angle);
        return end;
    }

    set end_point(end_point: Point) {
        this.end_angle = arcAngleAtPoint(this.center, end_point);
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
        const start_angle = this.start_angle;
        this.start_angle = this.end_angle;
        this.end_angle = start_angle;
        // TODO determine this with arcOrientation.
        this._direction = this._direction == DirectionEnum.CW ? DirectionEnum.CCW : DirectionEnum.CW
    }

    mirror(mirror: MirrorEnum, axisValue: number = 0) {
        const arc = mirrorArc(this.center.x, this.center.y, this.radius, this.start_angle, this.end_angle, this.direction, mirror, axisValue);
        this.center = new Point({x: arc.x, y: arc.y});
        this.radius = arc.radius;
        this.start_angle = arc.startAngle;
        this.end_angle = arc.endAngle;
    }

    translate(dx: number, dy: number) {
        this.center.translate(dx, dy);
    }

    toJSON() {
        return { ...this, start_point: this.start_point, end_point: this.end_point, 
            direction: this.direction, sweep_degrees: this.sweep_degrees };
    }

}