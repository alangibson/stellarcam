import { Boundary } from "./boundary";
import { Geometry } from "./geometry";
import { OriginEnum } from "./geometry.enum";
import { Point } from "./point";

/**
 * A bounded plane
 */
export class Area {

    geometries: Geometry[] = [];
    origin: Point = new Point({x: 0, y: 0});
    
    get width(): number {
        return Math.abs(this.max.x - this.min.x);
    }

    get height(): number {
        return Math.abs(this.max.y - this.min.y);
    }

    get min(): Point {
        let min_x: number = Number.MAX_SAFE_INTEGER;
        let min_y: number = Number.MAX_SAFE_INTEGER;
        for (let geo of this.geometries) {
            min_x = Math.min(min_x, geo.boundary.min.x);
            min_y = Math.min(min_y, geo.boundary.min.y);
        }
        return new Point({x: min_x, y: min_y});
    }

    get max(): Point {
        let max_x: number = 0;
        let max_y: number = 0;
        for (let geo of this.geometries) {
            max_x = Math.max(max_x, geo.boundary.max.x);
            max_y = Math.max(max_y, geo.boundary.max.y);
        }
        return new Point({x: max_x, y: max_y});
    }

    add(geometry: Geometry) {
        this.geometries.push(geometry);
    }

    translate(dx:number, dy:number) {
        for (let geo of this.geometries) {
            geo.translate(dx, dy);
        }
    }

}