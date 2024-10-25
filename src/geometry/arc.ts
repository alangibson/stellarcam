import { DirectionEnum } from "./geometry.enum";
import { arcBoundingBox, arcSweep, arcPoints, projectArc } from "./arc.function";
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

    constructor({ center, radius, start_angle, end_angle }: ArcProperties) {
        super();
        this.center = center;
        this.radius = radius;
        this.start_angle = start_angle;
        this.end_angle = end_angle;
    }
    
    get boundary(): Boundary {
        if (! this.bounding_box) {
            const {
                minX,
                minY,
                maxX,
                maxY,
                width,
                height
            } = arcBoundingBox(this.center.x, this.center.y, this.radius, this.start_angle, this.end_angle);
            this.bounding_box = new Boundary(new Point({x: minX, y: minY}), new Point({x: maxX, y: maxY}));
        }
        return this.bounding_box;
    }

    get direction(): DirectionEnum {
        const { direction } = arcSweep(this.start_angle_degrees, this.end_angle_degrees);
        return direction;
    }

    set direction(direction: DirectionEnum) {
        if (direction == this.direction)
            return;
        this.bust();
        // Change direction
        const start_angle = this.start_angle;
        this.start_angle = this.end_angle;
        this.end_angle = start_angle;
    }

    get sweep_degrees(): number {
        const { sweep_angle } = arcSweep(this.start_angle_degrees, this.end_angle_degrees);
        return sweep_angle;
    }

    get start_angle_degrees(): number {
        return this.start_angle * (180/Math.PI);
    }

    get end_angle_degrees(): number {
        return this.end_angle * (180/Math.PI);
    }

    get start_point(): Point {
        const { start } = arcPoints(this.center, this.radius, this.start_angle, this.end_angle);
        return start;
    }

    get end_point(): Point {
        const { end } = arcPoints(this.center, this.radius, this.start_angle, this.end_angle);
        return end;
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

    translate(dx: number, dy: number) {
        this.center.translate(dx, dy);
    }

    toJSON() {
        return {...this, start_point: this.start_point, end_point: this.end_point};
    }

}