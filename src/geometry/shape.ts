import { Boundary } from "./boundary";
import { Geometry } from "./geometry";
import { DirectionEnum, GeometryTypeEnum, MirrorEnum, OriginEnum } from "./geometry.enum";
import { Point } from "./point";

export abstract class Shape implements Geometry {
    
    abstract type: GeometryTypeEnum;
    abstract boundary: Boundary;
    abstract translate(dx: number, dy: number);
    abstract mirror(mirror: MirrorEnum, axisValue: number);
    abstract start_point: Point;
    abstract end_point: Point;
    abstract direction: DirectionEnum;
    // SVG path 'd' command
    abstract command: string;

    // TODO Used in debug visualization
    // middle_point(): Point
    // pointAlong(distance:number): Point;
    
}
