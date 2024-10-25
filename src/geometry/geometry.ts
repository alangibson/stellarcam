import { Boundary } from "./boundary";
import { GeometryTypeEnum, OriginEnum } from "./geometry.enum";
import { Point } from "./point";


export interface Geometry {
    type: GeometryTypeEnum;
    // Bounding box for this shape
    boundary: Boundary;
    start_point: Point;
    end_point: Point;
    command: string;
    
    translate(dx:number, dy:number);

}