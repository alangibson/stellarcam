import { SweepDirectionEnum } from "./arc";
import { Boundary } from "./boundary";
import { GeometryTypeEnum } from "./geometry.enum";
import { OriginEnum } from "./origin.enum";
import { Point } from "./point";
import { Shape } from "./shape";

function calculateBoundingBox(center: Point, radius: number) {
    // Top-left corner (x1, y1)
    const x1 = center.x - radius;
    const y1 = center.y - radius;

    // Top-right corner (x2, y1)
    const x2 = center.x + radius;

    // Bottom-left corner (x1, y2)
    const y2 = center.y + radius;

    // Return the bounding box with all four corners
    return {
        topLeft: new Point({ x: x1, y: y1 }),
        topRight: new Point({ x: x2, y: y1 }),
        bottomLeft: new Point({ x: x1, y: y2 }),
        bottomRight: new Point({ x: x2, y: y2 })
    };
}

// https://stackoverflow.com/a/27905268
function circlePath(center: Point, radius: number) {
    return 'M ' + center.x + ' ' + center.y + ' m -' + radius + ', 0 a ' + radius + ',' + radius + ' 0 1,1 ' + (radius * 2) + ',0 a ' + radius + ',' + radius + ' 0 1,1 -' + (radius * 2) + ',0';
}

export interface CircleProperties {
    center: Point;
    radius: number;
}

export class Circle extends Shape {

    type: GeometryTypeEnum = GeometryTypeEnum.CIRCLE;
    center: Point;
    radius: number;
    bounding_box: Boundary;

    constructor({ center, radius }: CircleProperties) {
        super();
        
        this.center = center;
        this.radius = radius;
    }

    get wind(): SweepDirectionEnum {
        // TODO do we ever need a CCW circle?
        return SweepDirectionEnum.CW;
    }

    get boundary(): Boundary {
        const { bottomLeft, topRight } = calculateBoundingBox(this.center, this.radius);
        const boundary = new Boundary(bottomLeft, topRight);
        this.bounding_box = boundary;
        return this.bounding_box;
    }

    // Start point is always top center (ie 0 degrees).
    get start_point(): Point {
        return new Point({
            x: this.center.x,
            y: this.center.y + this.radius
        });
    }

    // End point is always top center (ie 0 degrees).
    get end_point(): Point {
        return this.start_point;
    }

    get angle_degrees(): number {
        return 360;
    }

    get command(): string {
        let sweep_flag: number;
        if (this.wind == SweepDirectionEnum.CW)
            sweep_flag = 1;
        else
            sweep_flag = 0;
        const large_arc_flag = 0; // large=1, small=0
        // return `M ${this.start_point.x},${this.start_point.y} A ${this.radius} ${this.radius} ${this.angle_degrees} ${large_arc_flag} ${sweep_flag} ${this.end_point.x},${this.end_point.y}`
        return circlePath(this.center, this.radius);
    }

    translate(dx: number, dy: number) {
        this.center.translate(dx, dy);
        // Update bounding box
        const { bottomLeft, topRight } = calculateBoundingBox(this.center, this.radius);
        this.bounding_box.start_point = bottomLeft;
        this.bounding_box.end_point = topRight;
        // TODO notify subscribers of mutation
    }

    project(coord_origin: OriginEnum, width: number, height: number) {
        this.center.project(coord_origin, width, height);
        // Update bounding box
        const { bottomLeft, topRight } = calculateBoundingBox(this.center, this.radius);
        this.bounding_box.start_point = bottomLeft;
        this.bounding_box.end_point = topRight;
        // TODO notify subscribers of mutation
    }
}