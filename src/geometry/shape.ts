import { Rectangle } from "./rectangle/rectangle";
import { Geometry } from "./geometry";
import { DirectionEnum, GeometryTypeEnum, MirrorEnum } from "./geometry.enum";
import { Point, PointProperties } from "./point/point";

export abstract class Shape implements Geometry {

    // From geometry
    abstract type: GeometryTypeEnum;
    abstract boundary: Rectangle;
    abstract startPoint: Point;
    abstract endPoint: Point;
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
            this.endPoint.isEqual(shape.startPoint, tolerance) ||
            this.endPoint.isEqual(shape.endPoint, tolerance) ||
            this.startPoint.isEqual(shape.startPoint, tolerance) ||
            this.startPoint.isEqual(shape.endPoint, tolerance)
        );
    }

}
