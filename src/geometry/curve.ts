import { Boundary } from "./boundary";
import { GeometryTypeEnum } from "./geometry.enum";
import { OriginEnum } from "./origin.enum";
import { Point } from "./point";
import { Shape } from "./shape";

function cubicBezierBoundingBox(p0: Point, p1: Point, p2: Point, p3: Point) {
    // The bezier(t) function computes the point on the 
    // curve for a given parameter t (from 0 to 1).
    function bezier(t) {
        const x = Math.pow(1 - t, 3) * p0.x +
            3 * Math.pow(1 - t, 2) * t * p1.x +
            3 * (1 - t) * Math.pow(t, 2) * p2.x +
            Math.pow(t, 3) * p3.x;

        const y = Math.pow(1 - t, 3) * p0.y +
            3 * Math.pow(1 - t, 2) * t * p1.y +
            3 * (1 - t) * Math.pow(t, 2) * p2.y +
            Math.pow(t, 3) * p3.y;

        return [x, y];
    }

    //  initialize the bounding box coordinates using the control points.
    let minX = Math.min(p0.x, p1.x, p2.x, p3.x);
    let maxX = Math.max(p0.x, p1.x, p2.x, p3.x);
    let minY = Math.min(p0.y, p1.y, p2.y, p3.y);
    let maxY = Math.max(p0.y, p1.y, p2.y, p3.y);

    // By incrementing t in small steps (in this case, 0.01), 
    // we evaluate points on the curve and update the bounding box accordingly.
    for (let t = 0; t <= 1; t += 0.01) {
        const point = bezier(t);
        minX = Math.min(minX, point[0]);
        maxX = Math.max(maxX, point[0]);
        minY = Math.min(minY, point[1]);
        maxY = Math.max(maxY, point[1]);
    }

    // Return the bounding box as an object
    return {
        minX: minX,
        minY: minY,
        maxX: maxX,
        maxY: maxY
    };
}

function quadraticBezierBoundingBox(p0: Point, p1: Point, p2: Point) {
    // Function to evaluate the quadratic Bezier curve at a given t
    function bezier(t) {
        const x = Math.pow(1 - t, 2) * p0.x +
            2 * (1 - t) * t * p1.x +
            Math.pow(t, 2) * p2.x;

        const y = Math.pow(1 - t, 2) * p0.y +
            2 * (1 - t) * t * p1.y +
            Math.pow(t, 2) * p2.y;

        return [x, y];
    }

    // Initialize bounding box coordinates
    let minX = Math.min(p0.x, p1.x, p2.x);
    let maxX = Math.max(p0.x, p1.x, p2.x);
    let minY = Math.min(p0.y, p1.y, p2.y);
    let maxY = Math.max(p0.y, p1.y, p2.y);

    // Check for critical points
    for (let t = 0; t <= 1; t += 0.01) {
        const point = bezier(t);
        minX = Math.min(minX, point[0]);
        maxX = Math.max(maxX, point[0]);
        minY = Math.min(minY, point[1]);
        maxY = Math.max(maxY, point[1]);
    }

    // Return the bounding box as an object
    return {
        minX: minX,
        minY: minY,
        maxX: maxX,
        maxY: maxY
    };
}

export enum CurveTypeEnum {
    QUADRATIC = 'quadratic',
    CUBIC = 'cubic'
}

export interface CurveProperties {
    control_points: Point[],
    knots: number[]
}

export class Curve extends Shape {

    type: GeometryTypeEnum = GeometryTypeEnum.CURVE;
    control_points: Point[];
    knots: number[];

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
        const { minX, minY, maxX, maxY } = quadraticBezierBoundingBox(
            this.control_points[0], 
            this.control_points[1], 
            this.control_points[2]);
        return new Boundary(new Point({ x: minX, y: minY }), new Point({ x: maxX, y: maxY }));
    }

    get curve(): CurveTypeEnum {
        if (this.control_points.length == 3) {
            return CurveTypeEnum.QUADRATIC;
        } // TODO others?
    }

    get command(): string {
        return `M ${this.start_point.x},${this.start_point.y} Q ${this.control_points[1].x},${this.control_points[1].y} ${this.end_point.x},${this.end_point.y}`;
    }

    translate(dx: number, dy: number) {
        for (let p of this.control_points)
            p.translate(dx, dy);
    }

    project(coord_origin: OriginEnum, width: number, height: number) {
        for (let p of this.control_points)
            p.project(coord_origin, width, height);
    }

}