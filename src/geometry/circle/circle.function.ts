import { Circle, CircleProperties } from "./circle";
import { Point, PointProperties } from "../point/point";
import { rotatePoint, transformPoint } from "../point/point.function";

/**
 * Calculate bounding box for a circle.
 */
export function circleBoundingBox(center: Point, radius: number) {
  // Top-left corner (x1, y1)
  const x1 = center.x - radius;
  const y1 = center.y - radius;

  // Top-right corner (x2, y1)
  const x2 = center.x + radius;

  // Bottom-left corner (x1, y2)
  const y2 = center.y + radius;

  // Return the bounding box with all four corners
  return {
    topLeft: new Point({ x: x1, y: y1 }),
    topRight: new Point({ x: x2, y: y1 }),
    bottomLeft: new Point({ x: x1, y: y2 }),
    bottomRight: new Point({ x: x2, y: y2 }),
  };
}

// https://stackoverflow.com/a/27905268
export function circlePath(center: Point, radius: number) {
  return (
    "M " +
    center.x +
    " " +
    center.y +
    " m -" +
    radius +
    ", 0 a " +
    radius +
    "," +
    radius +
    " 0 1,1 " +
    radius * 2 +
    ",0 a " +
    radius +
    "," +
    radius +
    " 0 1,1 -" +
    radius * 2 +
    ",0"
  );
}

/** Return a point at a distance along a circle */
export function pointAlongCircle(
  cx,
  cy,
  r,
  start_x,
  start_y,
  distance,
  clockwise: boolean = true,
) {
  // Calculate the initial angle from the center to the starting point
  var theta0 = Math.atan2(start_y - cy, start_x - cx);
  // Calculate the change in angle corresponding to distance s
  var deltaTheta = distance / r;
  // Determine the new angle after moving distance s
  var theta1 = theta0 + deltaTheta;
  // Calculate the new point's coordinates
  var x1 = cx + r * Math.cos(theta1);
  var y1 = cy + r * Math.sin(theta1);
  return { x: x1, y: y1 };
}

/**
 * Rotates a circle around a center by a given angle.
 * @param {number} x - X-coordinate of the circle center.
 * @param {number} y - Y-coordinate of the circle center.
 * @param {number} radius - Radius of the circle.
 * @param {number} centerX - X-coordinate of the rotation center.
 * @param {number} centerY - Y-coordinate of the rotation center.
 * @param {number} angle - Rotation angle in radians.
 * @returns {Object} - Rotated circle parameters.
 */
export function rotateCircle(
  x,
  y,
  radius,
  centerX,
  centerY,
  angle,
): CircleProperties {
  const center: PointProperties = rotatePoint(x, y, centerX, centerY, angle);
  return { center, radius: radius };
}

export function transformCircle(circle: CircleProperties, matrix: number[]): CircleProperties {
  return {
    center: transformPoint(circle.center, matrix),
    radius: circle.radius
  };
}

/** Find middle point along the contour of a circle */
// export function circleMiddlePoint(circle: CircleProperties): PointProperties {
//   // Normalize angles between 0 and 2π
//   let angleStart = circle.startAngle % (2 * Math.PI);
//   let angleEnd = circle.endAngle % (2 * Math.PI);

//   // Ensure angleEnd is greater than angleStart
//   if (angleEnd < angleStart) {
//     angleEnd += 2 * Math.PI;
//   }

//   // Calculate the mid-angle
//   const midAngle = (angleStart + angleEnd) / 2;

//   // Compute the point at midAngle using circle parametric equations
//   const x = circle.center.x + circle.radius * Math.cos(midAngle);
//   const y = circle.center.y + circle.radius * Math.sin(midAngle);

//   return { x, y };
// }

/** Find the angle of a point along a circle contour */
export function circlePointToAngle(circle: CircleProperties, point: PointProperties): number {
  // Calculate the vector from the center to the point
  const dx = point.x - circle.center.x;
  const dy = point.y - circle.center.y;

  // Calculate the distance from the center to the point
  const distance = Math.hypot(dx, dy);

  // Check if the point lies approximately on the circle
  const tolerance = 1e-6; // Adjust tolerance as needed
  if (Math.abs(distance - circle.radius) > tolerance) {
      throw new Error('The point does not lie on the circle.');
  }

  // Calculate the angle using atan2
  let angle = Math.atan2(dy, dx);

  // Normalize angle to be between 0 and 2π
  if (angle < 0) {
      angle += 2 * Math.PI;
  }

  return angle; // Angle in radians
}