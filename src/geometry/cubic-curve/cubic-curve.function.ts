import { CubicCurveProperties } from "./cubic-curve";
import { DirectionEnum, MirrorEnum } from "../geometry.enum";
import { PointProperties } from "../point/point";
import {
  mirrorPoint,
  rotatePoint,
  transformPoint,
  translatePoint,
} from "../point/point.function";

export function cubicCurveBoundingBox(
  p0: PointProperties,
  p1: PointProperties,
  p2: PointProperties,
  p3: PointProperties,
) {
  // The bezier(t) function computes the point on the
  // curve for a given parameter t (from 0 to 1).
  function bezier(t) {
    const x =
      Math.pow(1 - t, 3) * p0.x +
      3 * Math.pow(1 - t, 2) * t * p1.x +
      3 * (1 - t) * Math.pow(t, 2) * p2.x +
      Math.pow(t, 3) * p3.x;

    const y =
      Math.pow(1 - t, 3) * p0.y +
      3 * Math.pow(1 - t, 2) * t * p1.y +
      3 * (1 - t) * Math.pow(t, 2) * p2.y +
      Math.pow(t, 3) * p3.y;

    return [x, y];
  }

  //  initialize the bounding box coordinates using the control points.
  let minX = Math.min(p0.x, p1.x, p2.x, p3.x);
  let maxX = Math.max(p0.x, p1.x, p2.x, p3.x);
  let minY = Math.min(p0.y, p1.y, p2.y, p3.y);
  let maxY = Math.max(p0.y, p1.y, p2.y, p3.y);

  // By incrementing t in small steps (in this case, 0.01),
  // we evaluate points on the curve and update the bounding box accordingly.
  for (let t = 0; t <= 1; t += 0.01) {
    const point = bezier(t);
    minX = Math.min(minX, point[0]);
    maxX = Math.max(maxX, point[0]);
    minY = Math.min(minY, point[1]);
    maxY = Math.max(maxY, point[1]);
  }

  // Return the bounding box as an object
  return {
    minX: minX,
    minY: minY,
    maxX: maxX,
    maxY: maxY,
  };
}

/**
 * Helper function to calculate the position on a cubic Bezier curve for a given t
 * @param {Object} P0 - Start point of the curve {x, y}
 * @param {Object} P1 - First control point of the curve {x, y}
 * @param {Object} P2 - Second control point of the curve {x, y}
 * @param {Object} P3 - End point of the curve {x, y}
 * @param {number} t - Parameter (0 <= t <= 1)
 * @returns {Object} - The x and y coordinates on the curve at t
 */
export function pointOnCubicCurve(P0, P1, P2, P3, t) {
  const x =
    Math.pow(1 - t, 3) * P0.x +
    3 * Math.pow(1 - t, 2) * t * P1.x +
    3 * (1 - t) * Math.pow(t, 2) * P2.x +
    Math.pow(t, 3) * P3.x;

  const y =
    Math.pow(1 - t, 3) * P0.y +
    3 * Math.pow(1 - t, 2) * t * P1.y +
    3 * (1 - t) * Math.pow(t, 2) * P2.y +
    Math.pow(t, 3) * P3.y;

  return { x, y };
}

/**
 * Main function to determine the direction of a cubic Bezier curve
 * @param {Object} P0 - Start point of the curve {x, y}
 * @param {Object} P1 - First control point of the curve {x, y}
 * @param {Object} P2 - Second control point of the curve {x, y}
 * @param {Object} P3 - End point of the curve {x, y}
 * @param {number} samples - Number of samples to take along the curve
 * @returns {DirectionEnum} - Either 'CW' or 'CCW' based on the curve direction
 */
export function cubicCurveDirection(
  P0,
  P1,
  P2,
  P3,
  samples = 100,
): DirectionEnum {
  let crossProductSum = 0;

  // Sample points along the curve and calculate cross products
  let previousPoint = pointOnCubicCurve(P0, P1, P2, P3, 0);
  for (let i = 1; i <= samples; i++) {
    const t = i / samples;
    const currentPoint = pointOnCubicCurve(P0, P1, P2, P3, t);

    // Calculate vector components for the cross product
    const dx = currentPoint.x - previousPoint.x;
    const dy = currentPoint.y - previousPoint.y;

    // Cross product with the previous vector to detect rotation direction
    crossProductSum += previousPoint.x * dy - previousPoint.y * dx;

    previousPoint = currentPoint;
  }

  // Determine direction based on the cross product sum
  return crossProductSum > 0 ? DirectionEnum.CCW : DirectionEnum.CW;
}

/**
 * Mirrors a cubic Bezier curve around a specified axis.
 *
 * @param {Array} cubicCurve - An array of four points defining the Bezier curve.
 * Each point is an object with 'x' and 'y' properties.
 * @param {number} axisValue - The value of the axis (x or y) to mirror around.
 * @param {string} [axis='vertical'] - The axis orientation ('vertical' or 'horizontal').
 * @returns {Array} - A new array of points representing the mirrored Bezier curve.
 */
export function mirrorCubicCurve(
  cubicCurve: CubicCurveProperties,
  mirror: MirrorEnum,
  axisValue: number,
): CubicCurveProperties {
  return {
    startPoint: mirrorPoint(cubicCurve.startPoint, mirror, axisValue),
    control1: mirrorPoint(cubicCurve.control1, mirror, axisValue),
    control2: mirrorPoint(cubicCurve.control2, mirror, axisValue),
    endPoint: mirrorPoint(cubicCurve.endPoint, mirror, axisValue),
  };
}

/**
 * Reverses the orientation of a cubic Bezier curve.
 *
 * @param {Array} cubicCurve - An array of four points defining the Bezier curve.
 * Each point is an object with 'x' and 'y' properties.
 * @returns {Array} - A new array of points representing the reversed Bezier curve.
 */
export function reverseCubicCurve(
  cubicCurve: CubicCurveProperties,
): CubicCurveProperties {
  // Reverse the control points to reverse the curve's orientation
  return {
    startPoint: cubicCurve.endPoint, // End point becomes the new start point
    control1: cubicCurve.control2, // Control point 2 becomes control point 1
    control2: cubicCurve.control1, // Control point 1 becomes control point 2
    endPoint: cubicCurve.startPoint, // Start point becomes the new end point
  };
}

/**
 * Translates a cubic Bezier curve by deltaX and deltaY.
 *
 * @param {Array} bezierCurve - An array of four points defining the Bezier curve.
 * Each point is an object with 'x' and 'y' properties.
 * @param {number} deltaX - The amount to translate along the x-axis.
 * @param {number} deltaY - The amount to translate along the y-axis.
 * @returns {Array} - A new array of points representing the translated Bezier curve.
 */
export function translateCubicCurve(
  cubicCurve: CubicCurveProperties,
  dx: number,
  dy: number,
): CubicCurveProperties {
  return {
    startPoint: translatePoint(
      cubicCurve.startPoint.x,
      cubicCurve.startPoint.y,
      dx,
      dy,
    ),
    control1: translatePoint(
      cubicCurve.control1.x,
      cubicCurve.control1.y,
      dx,
      dy,
    ),
    control2: translatePoint(
      cubicCurve.control2.x,
      cubicCurve.control2.y,
      dx,
      dy,
    ),
    endPoint: translatePoint(
      cubicCurve.endPoint.x,
      cubicCurve.endPoint.y,
      dx,
      dy,
    ),
  };
}

/**
 * Rotates a cubic curve around a center by a given angle.
 *
 * @param {number} startX - X-coordinate of the starting point.
 * @param {number} startY - Y-coordinate of the starting point.
 * @param {number} cp1x - X-coordinate of the first control point.
 * @param {number} cp1y - Y-coordinate of the first control point.
 * @param {number} cp2x - X-coordinate of the second control point.
 * @param {number} cp2y - Y-coordinate of the second control point.
 * @param {number} endX - X-coordinate of the ending point.
 * @param {number} endY - Y-coordinate of the ending point.
 * @param {number} centerX - X-coordinate of the rotation center.
 * @param {number} centerY - Y-coordinate of the rotation center.
 * @param {number} angle - Rotation angle in radians.
 * @returns {Object} - Rotated cubic curve parameters.
 */
export function rotateCubicCurve(
  startX,
  startY,
  cp1x,
  cp1y,
  cp2x,
  cp2y,
  endX,
  endY,
  centerX,
  centerY,
  angle,
): CubicCurveProperties {
  const p0: PointProperties = rotatePoint(
    startX,
    startY,
    centerX,
    centerY,
    angle,
  );
  const cp1: PointProperties = rotatePoint(cp1x, cp1y, centerX, centerY, angle);
  const cp2: PointProperties = rotatePoint(cp2x, cp2y, centerX, centerY, angle);
  const p1: PointProperties = rotatePoint(endX, endY, centerX, centerY, angle);
  return {
    startPoint: p0,
    control1: cp1,
    control2: cp2,
    endPoint: p1,
  };
}

export function transformCubicCurve(curve: CubicCurveProperties, matrix: number[]): CubicCurveProperties {
  return {
    startPoint: transformPoint(curve.startPoint, matrix),
    control1: transformPoint(curve.control1, matrix),
    control2: transformPoint(curve.control2, matrix),
    endPoint: transformPoint(curve.endPoint, matrix)
  };
}

/** Approximate middle point of cubic curve. 
 * Dividing into arcs first would give a more accurate result.
 */
export function cubicCurveMiddlePoint(curve: CubicCurveProperties): PointProperties {
  // Calculate the point at t = 0.5
  const t = 0.5;
  const oneMinusT = 1 - t;

  const x =
      oneMinusT ** 3 * curve.startPoint.x +
      3 * oneMinusT ** 2 * t * curve.control1.x +
      3 * oneMinusT * t ** 2 * curve.control2.x +
      t ** 3 * curve.endPoint.x;

  const y =
      oneMinusT ** 3 * curve.startPoint.y +
      3 * oneMinusT ** 2 * t * curve.control1.y +
      3 * oneMinusT * t ** 2 * curve.control2.y +
      t ** 3 * curve.endPoint.y;

  // Return the point at t = 0.5
  return { x, y };
}

export function offsetCubicCurve(curve: CubicCurveProperties, distance: number, samples: number = 100): PointProperties[][] {
  var innerOffsetPoints: PointProperties[] = [];
  var outerOffsetPoints: PointProperties[] = [];

  for (var i = 0; i <= samples; i++) {
      var t = i / samples;

      // Compute point on the curve B(t)
      var Bx = Math.pow(1 - t, 3) * curve.startPoint.x
             + 3 * Math.pow(1 - t, 2) * t * curve.control1.x
             + 3 * (1 - t) * Math.pow(t, 2) * curve.control2.x
             + Math.pow(t, 3) * curve.endPoint.x;
      var By = Math.pow(1 - t, 3) * curve.startPoint.y
             + 3 * Math.pow(1 - t, 2) * t * curve.control1.y
             + 3 * (1 - t) * Math.pow(t, 2) * curve.control2.y
             + Math.pow(t, 3) * curve.endPoint.y;

      // Compute derivative B'(t)
      var Bdx = -3 * Math.pow(1 - t, 2) * curve.startPoint.x
                + 3 * (Math.pow(1 - t, 2) - 2 * t * (1 - t)) * curve.control1.x
                + 3 * ((2 * t * (1 - t) - Math.pow(t, 2))) * curve.control2.x
                + 3 * Math.pow(t, 2) * curve.endPoint.x;
      var Bdy = -3 * Math.pow(1 - t, 2) * curve.startPoint.y
                + 3 * (Math.pow(1 - t, 2) - 2 * t * (1 - t)) * curve.control1.y
                + 3 * ((2 * t * (1 - t) - Math.pow(t, 2))) * curve.control2.y
                + 3 * Math.pow(t, 2) * curve.endPoint.y;

      // Compute normal vector N(t) = [-B'_y, B'_x]
      var Nx = -Bdy;
      var Ny = Bdx;

      // Normalize N(t)
      var N_length = Math.sqrt(Nx * Nx + Ny * Ny);
      if (N_length === 0) {
          // Handle zero length (tangent is zero vector), skip this point
          continue;
      }
      var Nx_unit = Nx / N_length;
      var Ny_unit = Ny / N_length;

      // Compute inner offset point (offset towards -N direction)
      var innerX = Bx - distance * Nx_unit;
      var innerY = By - distance * Ny_unit;
      innerOffsetPoints.push({ x: innerX, y: innerY });

      // Compute outer offset point (offset towards +N direction)
      var outerX = Bx + distance * Nx_unit;
      var outerY = By + distance * Ny_unit;
      outerOffsetPoints.push({ x: outerX, y: outerY });
  }

  return [innerOffsetPoints, outerOffsetPoints];
}