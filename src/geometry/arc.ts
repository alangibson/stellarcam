import { Boundary } from "./boundary";
import { GeometryTypeEnum } from "./geometry.enum";
import { OriginEnum } from "./origin.enum";
import { Point } from "./point";
import { Shape } from "./shape";

function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

function arcBoundingBox(cx, cy, radius, startAngle, endAngle) {
    // Convert start and end angles to radians
    let start = degToRad(startAngle);
    let end = degToRad(endAngle);

    // Normalize angles so that start is always less than or equal to end
    if (end < start) {
        [start, end] = [end, start];
    }

    // Function to calculate the coordinates of a point on the arc at a specific angle
    function pointAtAngle(angle) {
        return {
            x: cx + radius * Math.cos(angle),
            y: cy + radius * Math.sin(angle)
        };
    }

    // Initial bounding box: starting and ending points of the arc
    let startPoint = pointAtAngle(start);
    let endPoint = pointAtAngle(end);

    let minX = Math.min(startPoint.x, endPoint.x);
    let maxX = Math.max(startPoint.x, endPoint.x);
    let minY = Math.min(startPoint.y, endPoint.y);
    let maxY = Math.max(startPoint.y, endPoint.y);

    // Check for extreme points where the arc crosses the x and y axes
    // The critical angles where the extreme points occur are 0, 90, 180, and 270 degrees (in radians)
    const criticalAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

    criticalAngles.forEach(angle => {
        // Check if the critical angle lies within the arc's angular range
        if (angle >= start && angle <= end) {
            let extremePoint = pointAtAngle(angle);

            minX = Math.min(minX, extremePoint.x);
            maxX = Math.max(maxX, extremePoint.x);
            minY = Math.min(minY, extremePoint.y);
            maxY = Math.max(maxY, extremePoint.y);
        }
    });

    // Return the bounding box as an object with the min/max coordinates
    return {
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - minY
    };
}

function arcPoints(center: Point, radius: number, startAngle, endAngle) {
    // Calculate start point
    const startX = center.x + radius * Math.cos(startAngle);
    const startY = center.y + radius * Math.sin(startAngle);

    // Calculate end point
    const endX = center.x + radius * Math.cos(endAngle);
    const endY = center.y + radius * Math.sin(endAngle);

    // Return the start and end points as an object
    return {
        start: new Point({ x: startX, y: startY }),
        end: new Point({ x: endX, y: endY })
    };
}

function projectArc(origin: OriginEnum, startAngle: number, endAngle: number, radius:number) {
    let newStartAngle, newEndAngle;

    // Convert angles based on the origin system
    switch (origin) {
        case OriginEnum.TOP_LEFT: // same as bottom-right
        case OriginEnum.BOTTOM_RIGHT:
            // For top-left and bottom-right, we mirror the angles vertically
            newStartAngle = -startAngle;
            newEndAngle = -endAngle;
            break;
        case OriginEnum.TOP_RIGHT:
            // For top-right, we mirror angles horizontally and vertically
            newStartAngle = Math.PI - startAngle;
            newEndAngle = Math.PI - endAngle;
            break;
        case OriginEnum.BOTTOM_LEFT:
            // No change in angles
            newStartAngle = startAngle;
            newEndAngle = endAngle;
            break;
    }

    // Ensure angles are in the range [0, 2*PI]
    newStartAngle = normalizeAngle(newStartAngle);
    newEndAngle = normalizeAngle(newEndAngle);

    // Return the converted arc parameters
    return {
        radius: radius,
        startAngle: newStartAngle,
        endAngle: newEndAngle
    };
}

// Utility function to normalize angles to the range [0, 2*PI]
function normalizeAngle(angle) {
    let twoPi = 2 * Math.PI;
    return (angle % twoPi + twoPi) % twoPi;
}

// Calculate the clockwise or counterclockwise sweep of an arc between two angles,
function arcSweep(start_angle_degrees, end_angle_degrees) {
    // Normalize the angles to range [0, 360)
    let normalizedStart = start_angle_degrees % 360;
    let normalizedEnd = end_angle_degrees % 360;
    
    // If the angles are negative, bring them into positive range [0, 360)
    if (normalizedStart < 0) normalizedStart += 360;
    if (normalizedEnd < 0) normalizedEnd += 360;

    // Calculate the difference between the start and end angles
    let sweep = normalizedEnd - normalizedStart;

    // If the sweep is negative, it means we crossed the 0-degree point (clockwise)
    if (sweep < 0) {
        sweep += 360;
    }

    // Determine the direction (clockwise or counterclockwise)
    const isClockwise = sweep <= 180;

    return {
        sweep_angle: isClockwise ? sweep : 360 - sweep,
        direction: isClockwise ? SweepDirectionEnum.CW : SweepDirectionEnum.CCW
    };
}

/**
 * Converts a DXF LWPOLYLINE bulge to an arc (center, radius, start angle, end angle).
 * 
 * @param {number[]} startPoint - [x1, y1] coordinates of the start point of the segment.
 * @param {number[]} endPoint - [x2, y2] coordinates of the end point of the segment.
 * @param {number} bulge - The bulge value of the polyline segment.
 * @returns {object} Arc information with center, radius, start angle, end angle (in radians).
 */
export function dxfBulgeToArc(startPoint: Point, endPoint: Point, bulge: number): Arc {
    const [x1, y1] = [startPoint.x, startPoint.y];
    const [x2, y2] = [endPoint.x, endPoint.y];
    
    // console.log(`bulgeToArc. ${bulge} ${startPoint.x},${startPoint.y} ${endPoint.x},${endPoint.y}`);

    // Calculate the distance between start and end points (chord length)
    const chordLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    // console.log(`  chordLength: ${chordLength}`);

    // Calculate the included angle (in radians) from the bulge
    const includedAngle = 4 * Math.atan(Math.abs(bulge));
    // console.log(`  includedAngle: ${includedAngle}`);

    // Calculate the radius of the arc (radius is always positive)
    const radius = chordLength / (2 * Math.sin(includedAngle / 2));
    // console.log(`  radius: ${radius}`);

    // Midpoint of the chord
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    // console.log(`  mid: ${midX},${midY}`);

    // Perpendicular distance from the midpoint to the arc center
    const perpendicularDistance = radius * Math.cos(includedAngle / 2);
    // console.log(`  perpendicularDistance: ${perpendicularDistance}`);

    // Calculate the direction of the bulge (positive or negative determines arc direction)
    const dirX = -(y2 - y1) / chordLength;  // Perpendicular direction X
    const dirY = (x2 - x1) / chordLength;   // Perpendicular direction Y
    // console.log(`  dir: ${dirX},${dirY}`);

    // Calculate the center of the arc (bulge sign affects direction)
    const centerX = midX + dirX * perpendicularDistance * Math.sign(bulge);
    const centerY = midY + dirY * perpendicularDistance * Math.sign(bulge);
    // console.log(`  center: ${centerX},${centerY}`);

    // Calculate the start and end angles relative to the arc's center
    let startAngle = Math.atan2(y1 - centerY, x1 - centerX);
    let endAngle = Math.atan2(y2 - centerY, x2 - centerX);
    // For negative bulges, the arc is drawn clockwise, so we swap start and end angles
    if (bulge < 0) {
        [startAngle, endAngle] = [endAngle, startAngle];
    }
    // console.log(`  startAngle: ${startAngle}, endAngle: ${endAngle}`);

    return new Arc({
        center: new Point({x: centerX, y: centerY}),
        radius: radius,
        start_angle: startAngle,
        end_angle: endAngle
    });
}

export enum SweepDirectionEnum {
    CW = 'cw',
    CCW = 'ccw'
}

export interface ArcProperties {
    center: Point;
    radius: number;
    start_angle: number;
    end_angle: number;
}

export class Arc extends Shape {

    type: GeometryTypeEnum = GeometryTypeEnum.ARC;
    center: Point;
    radius: number;
    start_angle: number; // in radians
    end_angle: number; // in radians
    bounding_box: Boundary;

    constructor({ center, radius, start_angle, end_angle }: ArcProperties) {
        super();
        this.center = center;
        this.radius = radius;
        this.start_angle = start_angle;
        this.end_angle = end_angle;
        const {
            minX,
            minY,
            maxX,
            maxY,
            width,
            height
        } = arcBoundingBox(center.x, center.y, radius, start_angle, end_angle);
        this.bounding_box = new Boundary(new Point({x: minX, y: minY}), new Point({x: maxX, y: maxY}));
    }
    
    get boundary(): Boundary {
        return this.bounding_box;
    }

    get sweep_direction(): SweepDirectionEnum {
        const { direction } = arcSweep(this.start_angle_degrees, this.end_angle_degrees);
        return direction;
    }

    get sweep_degrees(): number {
        const { sweep_angle } = arcSweep(this.start_angle_degrees, this.end_angle_degrees);
        return sweep_angle;
    }

    get start_angle_degrees(): number {
        return this.start_angle * (180/Math.PI);
    }

    get end_angle_degrees(): number {
        return this.end_angle * (180/Math.PI);
    }

    get start_point(): Point {
        const { start } = arcPoints(this.center, this.radius, this.start_angle, this.end_angle);
        return start;
    }

    get end_point(): Point {
        const { end } = arcPoints(this.center, this.radius, this.start_angle, this.end_angle);
        return end;
    }

    get command(): string {
        let sweep_flag: number;
        if (this.sweep_direction == SweepDirectionEnum.CW)
            sweep_flag = 1;
        else
            sweep_flag = 0;
        const large_arc_flag = 0; // large=1, small=0
        return `M ${this.start_point.x},${this.start_point.y} A ${this.radius} ${this.radius} ${this.angle_degrees} ${large_arc_flag} ${sweep_flag} ${this.end_point.x},${this.end_point.y}`
    }

    // Degrees between start angle and end angle
    get angle_degrees(): number {
        return this.end_angle_degrees - this.start_angle_degrees;
    }

    translate(dx: number, dy: number) {
        this.center.translate(dx, dy);
        // TODO update this.boundary
        const {
            minX,
            minY,
            maxX,
            maxY,
        } = arcBoundingBox(this.center.x, this.center.y, this.radius, this.start_angle, this.end_angle);
        this.bounding_box.start_point.x = minX;
        this.bounding_box.start_point.y = minY;
        this.bounding_box.end_point.x = maxX;
        this.bounding_box.end_point.y = maxY;
        // TODO notify subscribers of mutation
    }

    project(coord_origin: OriginEnum, width: number, height: number) {
        // Convert center coordinates
        this.center.project(coord_origin, width, height);
        // and fix arc sweep
        const {radius, startAngle, endAngle} = projectArc(coord_origin, this.start_angle, this.end_angle, this.radius);
        this.radius = radius;
        this.start_angle = startAngle;
        this.end_angle = endAngle;
        // Update bounding box
        const {
            minX,
            minY,
            maxX,
            maxY
        } = arcBoundingBox(this.center.x, this.center.y, this.radius, this.start_angle, this.end_angle);
        this.bounding_box.start_point.x = minX;
        this.bounding_box.start_point.y = minY;
        this.bounding_box.end_point.x = maxX;
        this.bounding_box.end_point.y = maxY;
        // TODO notify subscribers of mutation
    }

}