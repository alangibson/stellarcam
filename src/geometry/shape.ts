import { Boundary } from "./boundary";
import { Geometry } from "./geometry";
import { DirectionEnum, GeometryTypeEnum, OriginEnum } from "./geometry.enum";
import { Point } from "./point";

export abstract class Shape implements Geometry {
    
    abstract type: GeometryTypeEnum;
    abstract boundary: Boundary;
    abstract translate(dx: number, dy: number);
    abstract start_point: Point;
    abstract end_point: Point;
    abstract direction: DirectionEnum;
    // SVG path 'd' command
    abstract command: string;

}
