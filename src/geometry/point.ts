import { Boundary } from "./boundary";
import { Geometry } from "./geometry";
import { GeometryTypeEnum, MirrorEnum, OriginEnum } from "./geometry.enum";
import { distanceBetweenPoints, mirrorPoint } from "./point.function";

export interface PointProperties {
    x: number;
    y: number;
}

export class Point implements Geometry {

    type: GeometryTypeEnum = GeometryTypeEnum.POINT;
    x: number;
    y: number;

    constructor({ x, y }: PointProperties) {
        this.x = x;
        this.y = y;
    }

    get boundary(): Boundary {
        return new Boundary(this, this);
    }

    // Generate a content-based hash
    get hash(): string {
        return `x:${this.x},y:${this.y}`;
    }

    get start_point(): Point {
        return this;
    }

    get end_point(): Point {
        return this;
    }

    get command(): string {
        return "";
    }

    mirror(mirror: MirrorEnum, axisValue: number) {
        const point: PointProperties = mirrorPoint(this, mirror, axisValue);
        this.x = point.x;
        this.y = point.y;
    }

    translate(dx: number, dy: number) {
        this.x += dx;
        this.y += dy;
    }

    distance(that: Point): number {
        return distanceBetweenPoints(this.x, this.y, that.x, that.y);
    }

    isEqual(that: Point, tolerance: number = 0): boolean {
        if (! that)
            return false;
        return this.distance(that) <= tolerance;
    }

    // Vector operations
    // https://gist.github.com/jjgrainger/808640fcb5764cf92c3cad960682c677?permalink_comment_id=2379464

    angle_radians(): number {
        return Math.atan2(this.y, this.x);
    }

    subtract(that: Point): Point {
        return new Point({x: this.x - that.x, y: this.y - that.y});
    };

    // Override toString for easy map key usage
    toString() {
        return `${this.x},${this.y}`;
    }
}