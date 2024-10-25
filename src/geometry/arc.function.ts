import { SweepDirectionEnum } from "./arc.enum";
import { OriginEnum } from "./geometry.enum";
import { Point } from "./point";

export function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

// Function to calculate the coordinates of a point on the arc at a specific angle
export function pointAtAngle(cx, cy, radius, angle) {
    return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
    };
}

export function arcBoundingBox(cx, cy, radius, startAngle, endAngle) {
    // Convert start and end angles to radians
    let start = degToRad(startAngle);
    let end = degToRad(endAngle);

    // Normalize angles so that start is always less than or equal to end
    if (end < start) {
        [start, end] = [end, start];
    }

    // Initial bounding box: starting and ending points of the arc
    let startPoint = pointAtAngle(cx, cy, radius, start);
    let endPoint = pointAtAngle(cx, cy, radius, end);

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
            let extremePoint = pointAtAngle(cx, cy, radius, angle);

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

/**
 * Calculate start and end point of arc.
 */
export function arcPoints(center: Point, radius: number, startAngle, endAngle) {
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

// Convert angles based on the origin system
export function projectArc(origin: OriginEnum, startAngle: number, endAngle: number, radius: number) {
    let newStartAngle, newEndAngle;
   
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
export function normalizeAngle(angle) {
    let twoPi = 2 * Math.PI;
    return (angle % twoPi + twoPi) % twoPi;
}

// Calculate the clockwise or counterclockwise sweep of an arc between two angles.
export function arcSweep(start_angle_degrees, end_angle_degrees) {
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
