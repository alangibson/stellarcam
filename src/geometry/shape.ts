import { Boundary } from "./boundary";
import { Geometry } from "./geometry";
import { GeometryTypeEnum, OriginEnum } from "./geometry.enum";
import { Point } from "./point";

export abstract class Shape implements Geometry {
    
    abstract type: GeometryTypeEnum;
    abstract boundary: Boundary;
    abstract translate(dx: number, dy: number);
    abstract project(coord_origin: OriginEnum, width: number, height: number);
    abstract start_point: Point;
    abstract end_point: Point;
    // SVG path 'd' command
    abstract command: string;

    //
    // For doubly linking Shapes into paths
    //
    next_shape: Shape;
    previous_shape: Shape;

    get forward(): Shape {
        return this.next_shape;
    }

    set forward(next: Shape) {
        this.next_shape = next;
    }
    
    get back(): Shape {
        return this.previous_shape;
    }

    set back(back: Shape) {
        this.previous_shape;
    }

}
