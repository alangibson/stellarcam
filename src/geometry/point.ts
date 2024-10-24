import { Boundary } from "./boundary";
import { Geometry, project } from "./geometry";
import { GeometryTypeEnum } from "./geometry.enum";
import { OriginEnum } from "./origin.enum";

export interface PointProperties {
    x: number;
    y: number;
}

export class Point implements Geometry {

    type: GeometryTypeEnum = GeometryTypeEnum.POINT;
    x: number;
    y: number;

    already_projected = false;
    
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

    translate(dx: number, dy: number) {
        this.x += dx;
        this.y += dy;
        // TODO notify subscribers of mutation
    }

    project(coord_origin: OriginEnum, width: number, height: number) {
        // FIXME HACK!
        if (this.already_projected) {
            // console.warn("HACK. Point already projected. Doing nothing.");
            return;
        }

        let {x, y} = project(this.x, this.y, coord_origin, width, height);
        this.x = x;
        this.y = y;
        // TODO notify subscribers of mutation

        this.already_projected = true;
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