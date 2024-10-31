import { Boundary } from "./boundary";
import { CurveTypeEnum } from "./curve.enum";
import { quadraticBezierBoundingBox, quadraticBezierMidpoint, quadraticBezierOrientation } from "./quadratic-curve.function";
import { DirectionEnum, GeometryTypeEnum, MirrorEnum } from "./geometry.enum";
import { Point } from "./point";
import { Shape } from "./shape";

export interface QuadraticCurveProperties {
    control_points: Point[],
    knots: number[]
}

export class QuadraticCurve extends Shape {

    type: GeometryTypeEnum = GeometryTypeEnum.QUADRATIC_CURVE;
    
    control_points: Point[];
    knots: number[];

    bounding_box: Boundary;

    constructor({ control_points, knots }: QuadraticCurveProperties) {
        super();
        
        this.control_points = control_points;
        this.knots = knots;
    }

    get start_point(): Point {
        return this.control_points[0];
    }

    set start_point(start_point: Point) {
        this.control_points[0] = start_point;
    }

    get middle_point(): Point {
        return quadraticBezierMidpoint(this.control_points[0], this.control_points[1], this.control_points[2]);
    }

    get end_point(): Point {
        return this.control_points[2];
    }

    set end_point(end_point: Point) {
        this.control_points[2] = end_point;
    }

    get boundary(): Boundary {
        if (! this.bounding_box) {
            const { minX, minY, maxX, maxY } = quadraticBezierBoundingBox(
                this.control_points[0], 
                this.control_points[1], 
                this.control_points[2]);
            this.bounding_box = new Boundary(new Point({ x: minX, y: minY }), new Point({ x: maxX, y: maxY }));
        }
        return this.bounding_box;
    }

    get direction(): DirectionEnum {
        return quadraticBezierOrientation(this.control_points[0], this.control_points[1], this.control_points[2]);
    }

    set direction(direction: DirectionEnum) {
        if (direction == this.direction)
            return;
        // Change direction
        this.bust();
        this.reverse();
    }

    get curve(): CurveTypeEnum {
        if (this.control_points.length == 3) {
            return CurveTypeEnum.QUADRATIC;
        } // TODO others?
    }

    get command(): string {
        return `M ${this.start_point.x},${this.start_point.y} Q ${this.control_points[1].x},${this.control_points[1].y} ${this.end_point.x},${this.end_point.y}`;
    }

    private bust() {
        this.bounding_box = null;
    }

    reverse() {
        const end_point = this.control_points[2];
        this.control_points[2] = this.control_points[0];
        this.control_points[0] = end_point;
    }
    
    mirror(mirror: MirrorEnum, axisValue: number = 0) {
        this.control_points[0].mirror(mirror, axisValue);
        this.control_points[1].mirror(mirror, axisValue);
        this.control_points[2].mirror(mirror, axisValue);
    }
    
    translate(dx: number, dy: number) {
        for (let p of this.control_points)
            p.translate(dx, dy);
    }

}