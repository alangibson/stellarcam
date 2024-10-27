import { Boundary } from "./boundary";
import { DirectionEnum, GeometryTypeEnum, MirrorEnum, OriginEnum } from "./geometry.enum";
import { Point } from "./point";


export interface Geometry {
    type: GeometryTypeEnum;
    // Bounding box for this shape
    boundary: Boundary;
    start_point: Point;
    end_point: Point;
    command: string;
    
    mirror(mirror: MirrorEnum, axisValue: number);
    translate(dx:number, dy:number);

}