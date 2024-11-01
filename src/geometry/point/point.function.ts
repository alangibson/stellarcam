import { MirrorEnum } from "../geometry.enum";
import { PointProperties } from "./point";

export function translatePoint(x, y, dx, dy): PointProperties {
    return {
        x: x + dx,
        y: y + dy,
    };
}

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
export function mirrorPoint(point: PointProperties, mirror: MirrorEnum, axisValue = 0) {
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

export function distanceBetweenPoints(x1, y1, x2, y2) {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);

}

/**
 * Rotates a point around a center by a given angle.
 * 
 * @param {number} x - X-coordinate of the point.
 * @param {number} y - Y-coordinate of the point.
 * @param {number} centerX - X-coordinate of the rotation center.
 * @param {number} centerY - Y-coordinate of the rotation center.
 * @param {number} angle - Rotation angle in radians.
 * @returns {PointProperties} - Rotated point coordinates.
 */
export function rotatePoint(x, y, centerX, centerY, angle): PointProperties {
    const dx = x - centerX;
    const dy = y - centerY;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const xRotated = dx * cos - dy * sin + centerX;
    const yRotated = dx * sin + dy * cos + centerY;
    return { x: xRotated, y: yRotated };
}