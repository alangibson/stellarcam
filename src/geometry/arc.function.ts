import { DirectionEnum, MirrorEnum } from "./geometry.enum";
import { OriginEnum } from "./geometry.enum";
import { Point, PointProperties } from "./point";

export function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

// Normalize the angles to the range -π to π
const normalizeSignedAngle = (angle) => Math.atan2(Math.sin(angle), Math.cos(angle));

/** Utility function to normalize angles to the range [0, 2*PI] */
export function normalizeAngle(angle) {
    let twoPi = 2 * Math.PI;
    return (angle % twoPi + twoPi) % twoPi;
}

export function normalizeAngleDegrees(angleDegrees: number): number {
    return (angleDegrees + 360) % 360
}

// Calculate the coordinates of a point on the arc at a specific angle
export function pointAtAngle(cx, cy, radius, angle) {
    return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
    };
}

/** Calculate a bounding box for the arc */
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

/** Calculate start and end point of arc. */
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

/** Calculate midpoint of an arc */
export function arcMidpoint(cx, cy, r, startAngle, endAngle, useLongArc = false) {
    // Normalize the angles to be between 0 and 2*PI
    startAngle = (startAngle + 2 * Math.PI) % (2 * Math.PI);
    endAngle = (endAngle + 2 * Math.PI) % (2 * Math.PI);

    // Calculate the angular difference
    let deltaAngle = endAngle - startAngle;

    // Adjust deltaAngle to be between -PI and PI
    if (deltaAngle > Math.PI) {
        deltaAngle -= 2 * Math.PI;
    } else if (deltaAngle < -Math.PI) {
        deltaAngle += 2 * Math.PI;
    }

    // If useLongArc is true, adjust deltaAngle to use the longer arc
    if (useLongArc) {
        if (deltaAngle > 0) {
            deltaAngle -= 2 * Math.PI;
        } else {
            deltaAngle += 2 * Math.PI;
        }
    }

    // Calculate the midpoint angle
    let midAngle = startAngle + deltaAngle / 2;

    // Ensure midAngle is between 0 and 2*PI
    midAngle = (midAngle + 2 * Math.PI) % (2 * Math.PI);

    // Calculate the midpoint coordinates
    let mx = cx + r * Math.cos(midAngle);
    let my = cy + r * Math.sin(midAngle);

    return { x: mx, y: my };
}

/** Calculate angle of a point from center of arc */
export function arcAngleAtPoint(center: PointProperties, point: PointProperties) {
    // Extract the x and y coordinates from the input
    const { x: centerX, y: centerY } = center;
    const { x: startX, y: startY } = point;

    // Calculate the angle from the center to the start point using atan2
    // Math.atan2 returns the angle in radians between -PI and PI
    const startAngle = Math.atan2(startY - centerY, startX - centerX);

    // Optionally, if you want to normalize the angle to be in the range [0, 2 * PI]
    const normalizedAngle = (startAngle + 2 * Math.PI) % (2 * Math.PI);

    return normalizedAngle;
}

/** Convert angles based on the origin system */
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

// Calculate the clockwise or counterclockwise sweep of an arc between two angles.
export function arcDirection(start_angle_degrees, end_angle_degrees) {
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
        direction: isClockwise ? DirectionEnum.CW : DirectionEnum.CCW
    };
}

/**
export function arcOrientation(startAngle, endAngle) {
    // Angles in a clockwise direction are negative.
    // Angles in a counterclockwise direction are positive.

    // Normalize angles to [0, 2 * PI) range
    // const normalizedStart = startAngle % (2 * Math.PI);
    // const normalizedEnd = endAngle % (2 * Math.PI);
    // Normalize both angles to the range [0, 2 * PI)

    const TWO_PI = 2 * Math.PI;

    // Normalize both angles to the range [0, 2 * PI)
    const normalizedStart = ((startAngle % TWO_PI) + TWO_PI) % TWO_PI;
    const normalizedEnd = ((endAngle % TWO_PI) + TWO_PI) % TWO_PI;

    // Calculate clockwise and counterclockwise sweeps
    const clockwiseSweep = (normalizedEnd - normalizedStart + TWO_PI) % TWO_PI;
    const counterclockwiseSweep = (normalizedStart - normalizedEnd + TWO_PI) % TWO_PI;

    // Determine the correct direction and sweep
    // let sweepAngle, direction;
    // if (clockwiseSweep <= counterclockwiseSweep) {
    //     sweepAngle = clockwiseSweep;
    //     direction = DirectionEnum.CW;
    // } else {
    //     sweepAngle = counterclockwiseSweep;
    //     direction = DirectionEnum.CCW;
    // }

    // Adjust sweep if it's negative (ensure positive sweep in [0, 2 * PI) range)
    // let direction: DirectionEnum;
    // if (sweep < 0) {
    //     sweep += 2 * Math.PI;
        // direction = DirectionEnum.CW;
    // } else if (sweep > 0) {
        // direction = DirectionEnum.CCW;
    // } else {
        // TODO is this a valid assumption?
        // No change, so just assume CW
        // direction = DirectionEnum.CW;
    // }

    // Special case: if the sweep is exactly PI, prefer the direction based on angle sign
    // if (sweepAngle === Math.PI) {
    //     // If end angle is negative relative to start, choose counterclockwise; otherwise, clockwise
    //     direction = endAngle > startAngle ? DirectionEnum.CCW : DirectionEnum.CW;
    // }

    // TODO test case:
    // const startAngle = Math.PI / 4;   // 45 degrees
    // const endAngle = (3 * Math.PI) / 2; // 270 degrees
    // console.log(calculateArcSweep(startAngle, endAngle)); // Expected output: 4.71238898038469 radians (or 270 degrees)

    // Determine the direction based on the shortest path
    if (clockwiseSweep <= counterclockwiseSweep) {
        return DirectionEnum.CW;  // Clockwise
    } else {
        return DirectionEnum.CCW; // Counterclockwise
    }

    // return direction;
}
*/

/** Calculate signed, non-normalized sweep of an arc. */
export function arcSweep(startAngle: number, endAngle: number): number {
    return endAngle - startAngle;
}

function round(num, places) {
    return parseFloat(num.toFixed(places));
}

/**
 * In DXF, and in math generally, sweep direction is CCW by default.
 * If the start angle is less than the end angle, the arc will naturally move 
 * counterclockwise from the start to the end. 
 * If the start angle is greater than the end angle, the arc still moves 
 * counterclockwise but passes through the 0-degree point.
 */
export function arcOrientation(startAngle: number, endAngle: number): DirectionEnum {
    // Hard coded to CCW because it's always CCW in DXF
    let direction: DirectionEnum = DirectionEnum.CCW;
    // TODO when is it CW?
    return direction;
}

/** Return a point at a distance along an arc */
export function pointAlongArc(cx, cy, r, startAngle, endAngle, distance, clockwise) {

    // Normalize the angle difference based on the direction
    function angleDifference(angle1, angle2, clockwise) {
        let diff = angle2 - angle1;
        if (clockwise) {
            if (diff > 0) {
                diff -= 2 * Math.PI;
            }
        } else {
            if (diff < 0) {
                diff += 2 * Math.PI;
            }
        }
        return diff;
    }

    // Calculate the total angle difference and arc length
    const deltaAngle = angleDifference(startAngle, endAngle, clockwise);
    const arcLength = Math.abs(deltaAngle) * r;

    // Clamp the distance to the arc length
    if (distance < 0 || distance > arcLength) {
        distance = Math.max(0, Math.min(distance, arcLength));
    }

    // Calculate the proportion of the arc traversed
    const proportion = distance / arcLength;

    // Compute the angle at the given distance
    const angleAtDistance = startAngle + proportion * deltaAngle;

    // Calculate the x and y coordinates
    const x = cx + r * Math.cos(angleAtDistance);
    const y = cy + r * Math.sin(angleAtDistance);

    return { x, y };
}

/** Mirror arc across an axis */
export function mirrorArc(x, y, radius, startAngle, endAngle, direction: DirectionEnum, mirror: MirrorEnum, axisValue: number) {
    let clockwise: boolean = (direction == DirectionEnum.CW);

    if (mirror === MirrorEnum.VERTICAL) {
        // Mirror over vertical axis x = axisValue
        x = 2 * axisValue - x;
        startAngle = Math.PI - startAngle;
        endAngle = Math.PI - endAngle;
        clockwise = !clockwise;
    } else if (mirror === MirrorEnum.HORIZONTAL) {
        // Mirror over horizontal axis y = axisValue
        y = 2 * axisValue - y;
        startAngle = -startAngle;
        endAngle = -endAngle;
        clockwise = !clockwise;
    }

    const newDirection: DirectionEnum = clockwise ? DirectionEnum.CW : DirectionEnum.CCW;

    return { x, y, radius, startAngle, endAngle, direction: newDirection };
}

