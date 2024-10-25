import { Boundary } from "./boundary";
import { Geometry } from "./geometry";
import { OriginEnum } from "./geometry.enum";
import { Point } from "./point";

/**
 * A bounded plane
 */
export class Area {

    // Default is same as a DXF file (positive and negative point values allowed)
    origin_at: OriginEnum = OriginEnum.MIDDLE_CENTER;
    geometries: Geometry[] = [];
    // Top-left point of geometries
    start_point: Point;
    // Bottom-right point of geometries
    end_point: Point;
    
    get width(): number {
        return Math.abs(this.end_point.x - this.start_point.x);
    }

    get height(): number {
        return Math.abs(this.end_point.y - this.start_point.y);
    }

    get origin(): Point {
        const translateX = Math.min(0, this.start_point.x, this.end_point.x);
        const translateY = Math.min(0, this.start_point.y, this.end_point.y);
        return new Point({x: translateX, y: translateY});
    }

    /**
     * Grow (if needed) to fit Boundary inside this Area
     */
    grow(boundary: Boundary) {
        if (this.start_point) {
            const start_point_x = Math.min(this.start_point.x, boundary.start_point.x);
            const start_point_y = Math.max(this.start_point.y, boundary.start_point.y);
            this.start_point = new Point({ x: start_point_x, y: start_point_y });
        } else {
            this.start_point = new Point({ x: boundary.start_point.x, y: boundary.start_point.y });
        }

        if (this.end_point) {
            const end_point_x = Math.max(this.end_point.x, boundary.end_point.x);
            const end_point_y = Math.min(this.end_point.y, boundary.end_point.y);
            this.end_point = new Point({ x: end_point_x, y: end_point_y });
        } else {
            this.end_point = new Point({ x: boundary.end_point.x, y: boundary.end_point.y });
        }
    }

    add(geometry: Geometry) {
        this.geometries.push(geometry);
        this.grow(geometry.boundary);
    }

    translate(dx:number, dy:number) {
        this.start_point = null;
        this.end_point = null;
        for (let geo of this.geometries) {
            geo.translate(dx, dy);
            // TODO do this via subscribe/notify instead
            this.grow(geo.boundary);
        }
    }
    
    project(coord_origin: OriginEnum) {
        this.origin_at = coord_origin;
        // this.start_point = null;
        // this.end_point = null;
        for (let geo of this.geometries) {
            // FIXME can't call this.width, this.height when this.*_point == null
            geo.project(coord_origin, this.width, this.height);
            // TODO do this via subscribe/notify instead
            // this.grow(geo.boundary);
        }
        // TODO fix start and end points here?
    }

}