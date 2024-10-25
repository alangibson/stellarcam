import { Boundary } from "./boundary";
import { CurveTypeEnum } from "./curve.enum";
import { quadraticBezierBoundingBox, quadraticBezierOrientation } from "./curve.function";
import { DirectionEnum, GeometryTypeEnum } from "./geometry.enum";
import { Point } from "./point";
import { Shape } from "./shape";

export interface CurveProperties {
    control_points: Point[],
    knots: number[]
}

export class Curve extends Shape {

    type: GeometryTypeEnum = GeometryTypeEnum.CURVE;
    
    control_points: Point[];
    knots: number[];

    bounding_box: Boundary;

    constructor({ control_points, knots }: CurveProperties) {
        super();
        this.control_points = control_points;
        this.knots = knots;
    }

    get start_point(): Point {
        return this.control_points[0];
    }

    get end_point(): Point {
        return this.control_points[2];
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
        this.bust();
        // Change direction
        const end_point = this.control_points[2];
        this.control_points[2] = this.control_points[0];
        this.control_points[0] = end_point;
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

    translate(dx: number, dy: number) {
        for (let p of this.control_points)
            p.translate(dx, dy);
    }

}
