import { Boundary } from "./boundary";
import { Geometry } from "./geometry";
import { DirectionEnum, GeometryTypeEnum, MirrorEnum } from "./geometry.enum";
import { Point, PointProperties } from "./point";

export abstract class Shape implements Geometry {

    // From geometry
    abstract type: GeometryTypeEnum;
    abstract boundary: Boundary;
    abstract start_point: Point;
    abstract end_point: Point;
    abstract command: string;
    abstract mirror(mirror: MirrorEnum, axisValue: number);
    abstract translate(dx: number, dy: number);
    abstract rotate(center: PointProperties, angle: number);
    // Defined on Shape
    abstract direction: DirectionEnum;

    // Swap start and end points, at a minimum. 
    // Implementing classes must also take care of any points in between.
    abstract reverse();
    
    isConnectedTo(shape: Shape, tolerance: number = 0.01) {
        return (
            this.end_point.isEqual(shape.start_point, tolerance) ||
            this.end_point.isEqual(shape.end_point, tolerance) ||
            this.start_point.isEqual(shape.start_point, tolerance) ||
            this.start_point.isEqual(shape.end_point, tolerance)
        );
    }

}
