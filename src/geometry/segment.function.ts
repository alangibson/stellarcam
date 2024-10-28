import { DirectionEnum } from "./geometry.enum";
import { Point, PointProperties } from "./point";

/**
 * Calculates a point at a specified distance along a line segment.
 *
 * @param {number} x0 - X-coordinate of the starting point.
 * @param {number} y0 - Y-coordinate of the starting point.
 * @param {number} x1 - X-coordinate of the ending point.
 * @param {number} y1 - Y-coordinate of the ending point.
 * @param {number} distance - Distance to travel along the line from the starting point.
 * @returns {{x: number, y: number}} Coordinates of the point after traveling distance.
 */
export function pointAlongSegment(x0, y0, x1, y1, distance) {
    // Calculate the difference in coordinates
    var dx = x1 - x0;
    var dy = y1 - y0;
    // Calculate the length of the line segment
    var length = Math.sqrt(dx * dx + dy * dy);
    // Normalize the direction vector
    var dx_norm = dx / length;
    var dy_norm = dy / length;
    // Calculate the new point's coordinates
    var x = x0 + dx_norm * distance;
    var y = y0 + dy_norm * distance;
    return { x: x, y: y };
}

export function segmentDirection(start: PointProperties, end: PointProperties): DirectionEnum {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const angle = Math.atan2(deltaY, deltaX); // Angle in radians between -π and π
  
    if (angle >= 0) {
      return DirectionEnum.CW;
    } else {
      return DirectionEnum.CCW;
    }
  }