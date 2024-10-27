import { Geometry } from "./geometry";
import { DirectionEnum } from "./geometry.enum";

export interface Shape extends Geometry {
    
    direction: DirectionEnum;

    // TODO Used in debug visualization
    // middle_point(): Point
    // pointAlong(distance:number): Point;
    
}
