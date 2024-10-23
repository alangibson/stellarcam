import { Boundary } from "./boundary";
import { GeometryTypeEnum } from "./geometry.enum";
import { OriginEnum } from "./origin.enum";

export function project(x, y, origin: OriginEnum, width, height) {
    let projectedX, projectedY;
    
    switch(origin) {
        case OriginEnum.BOTTOM_LEFT:
            // No need to change x or y, origin is already at (0,0)
            projectedX = x;
            projectedY = y;
            break;
            
        case OriginEnum.BOTTOM_RIGHT:
            // Flip the x-axis (origin is at the bottom-right)
            projectedX = width - x;
            projectedY = y;
            break;
            
        case OriginEnum.TOP_LEFT:
            // Flip the y-axis (origin is at the top-left)
            projectedX = x;
            projectedY = height - y;
            break;
            
        case OriginEnum.TOP_RIGHT:
            // Flip both the x-axis and y-axis (origin is at the top-right)
            projectedX = width - x;
            projectedY = height - y;
            break;
            
        default:
            throw new Error("Invalid origin. Please select one of 'bottom-left', 'bottom-right', 'top-left', or 'top-right'.");
    }

    return { x: projectedX, y: projectedY };
}

export interface Geometry {
    type: GeometryTypeEnum;
    // Bounding box for this shape
    boundary: Boundary;
    
    translate(dx:number, dy:number);
    
    project(coord_origin: OriginEnum, width: number, height: number);
}