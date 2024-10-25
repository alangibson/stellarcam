import { Boundary } from "./boundary";
import { Geometry } from "./geometry";
import { GeometryTypeEnum, OriginEnum } from "./geometry.enum";
import { project } from "./geometry.function";

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

    translate(dx: number, dy: number) {
        this.x += dx;
        this.y += dy;
    }

    distance(that: Point): number {
        const deltaX = that.x - this.x;
        const deltaY = that.y - this.y;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }

    // Vector operations
    // https://gist.github.com/jjgrainger/808640fcb5764cf92c3cad960682c677?permalink_comment_id=2379464

    angle_radians(): number {
        return Math.atan2(this.y, this.x);
    }

    subtract(that: Point): Point {
        return new Point({x: this.x - that.x, y: this.y - that.y});
    };
}