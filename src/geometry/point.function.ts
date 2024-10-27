import { MirrorEnum } from "./geometry.enum";
import { Point } from "./point";

export function angleBetweenPoints(start_x, start_y, end_x, end_y) {
    // Calculate the difference in x and y
    const dx = end_x - start_x;
    const dy = end_y - start_y;

    // Calculate the angle in radians
    const radians = Math.atan2(dx, dy);

    // Convert radians to degrees
    const degrees = (radians * (180 / Math.PI));

    // Ensure the angle is positive (0 to 360 degrees)
    const normalized_angle = (degrees + 360) % 360;

    return normalized_angle;
}

/**
 * Mirror a point over an axis line.
 * 
 * @param point 
 * @param mirror 
 * @param axisValue either x or y value, depending on value of direction
 * @returns 
 */
export function mirrorPoint(point: Point, mirror: MirrorEnum, axisValue = 0) {
    if (mirror === MirrorEnum.VERTICAL) {
        // Mirror over the line x = axisValue
        return { x: 2 * axisValue - point.x, y: point.y };
    } else if (mirror === MirrorEnum.HORIZONTAL) {
        // Mirror over the line y = axisValue
        return { x: point.x, y: 2 * axisValue - point.y };
    } else {
        throw new Error('Invalid direction. Use "horizontal" or "vertical".');
    }
}
