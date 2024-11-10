import { QuadraticCurveProperties } from "../quadratic-curve/quadratic-curve";
import { Point, PointProperties } from "../point/point";
import { CubicCurveProperties } from "../cubic-curve/cubic-curve";
import { Ellipse, EllipseProperties } from "./ellipse";
import { transformPoint } from "../point/point.function";

export function ellipseAngleRange(startAngle, endAngle) {
  return Math.abs(endAngle - startAngle);
}

/** Helper function to determine if an arc represents a closed ellipse */
export function ellipseIsClosed(startAngle: number, endAngle: number): boolean {
  return ellipseAngleRange(startAngle, endAngle) >= 2 * Math.PI;
}

/**
 * Calculates the rotation angle of an ellipse in radians.
 *
 * @param {EllipseProperties} ellipse - The properties of the ellipse.
 * @returns {number} The rotation angle in radians.
 */
export function ellipseRotation(cx, cy, fx, fy) {
  const deltaX = fx - cx;
  const deltaY = fy - cy;
  const rotationAngle = Math.atan2(deltaY, deltaX);
  return rotationAngle;
}

// Convert an arc segment of an ellipse to a cubic Bézier curve
export function arcToCubicCurve(
  cx,
  cy,
  rx,
  ry,
  startAngle,
  endAngle,
  rotationAngle,
): CubicCurveProperties {
  const theta = (endAngle - startAngle) / 2;
  const alpha =
    (Math.sin(theta) * (Math.sqrt(4 + 3 * Math.pow(Math.tan(theta), 2)) - 1)) /
    3;

  const x1 = Math.cos(startAngle);
  const y1 = Math.sin(startAngle);
  const x2 = Math.cos(endAngle);
  const y2 = Math.sin(endAngle);

  const cosPhi = Math.cos(rotationAngle);
  const sinPhi = Math.sin(rotationAngle);

  // Start point in local coordinates
  const x1p = rx * x1;
  const y1p = ry * y1;

  // Rotate and translate to get the actual start point
  const start = {
    x: cx + x1p * cosPhi - y1p * sinPhi,
    y: cy + x1p * sinPhi + y1p * cosPhi,
  };

  // End point in local coordinates
  const x2p = rx * x2;
  const y2p = ry * y2;

  // Rotate and translate to get the actual end point
  const end = {
    x: cx + x2p * cosPhi - y2p * sinPhi,
    y: cy + x2p * sinPhi + y2p * cosPhi,
  };

  // Control points in local coordinates
  const dx1 = -alpha * rx * y1;
  const dy1 = alpha * ry * x1;
  const dx2 = alpha * rx * y2;
  const dy2 = -alpha * ry * x2;

  // Rotate and translate control points
  const control1 = {
    x: start.x + dx1 * cosPhi - dy1 * sinPhi,
    y: start.y + dx1 * sinPhi + dy1 * cosPhi,
  };

  const control2 = {
    x: end.x + dx2 * cosPhi - dy2 * sinPhi,
    y: end.y + dx2 * sinPhi + dy2 * cosPhi,
  };

  return {
    startPoint: start,
    control1,
    control2,
    endPoint: end,
  };
}

/**
 * Convert an ellipse to multiple cubic Bézier curves.
 *
 * @param cx Center point
 * @param cy Center point
 * @param fx Focus
 * @param fy Focus
 * @param axisRatio
 * @param startAngle
 * @param endAngle
 * @returns
 */
export function ellipseToCubicCurves(
  {
    center,
    focus,
    axisRatio,
    startAngle,
    endAngle
  }: EllipseProperties
): CubicCurveProperties[] {
  const curves = [];
  const step = Math.PI / 2; // Split the ellipse into segments (quarter arcs)

  // Adjust ry based on the axis ratio
  focus.y = focus.x * axisRatio;

  const rotationAngle: number = ellipseRotation(center.x, center.y, focus.x, focus.y);
  // const rotationAngle = 0;

  // Determine if the ellipse should be closed
  const isClosed = ellipseIsClosed(startAngle, endAngle);

  // Loop through segments and approximate each with a Bézier curve
  for (let angle = startAngle; angle < endAngle; angle += step) {
    const segmentEnd = Math.min(angle + step, endAngle);
    const bezierCurve = arcToCubicCurve(
      center.x,
      center.y,
      focus.x,
      focus.y,
      angle,
      segmentEnd,
      rotationAngle,
    );
    curves.push(bezierCurve);
  }

  // If the ellipse is closed and spans 2π, add an extra segment to close the shape
  if (isClosed && startAngle !== endAngle) {
    const closingCurve = arcToCubicCurve(
      center.x,
      center.y,
      focus.x,
      focus.y,
      endAngle,
      startAngle,
      rotationAngle,
    );
    curves.push(closingCurve);
  }

  return curves;
}

/**
 * Approximate midpoint on countour by Simple Angle Averaging.
 * Midpoint by Arc Length is more accurate.
 */
export function ellipseMiddlePoint(ellipse: EllipseProperties): PointProperties {
  const {
    center,
    focus,
    axisRatio,
    startAngle,
    endAngle,
  } = ellipse;

  // Calculate the averaged angle
  let midAngle = (startAngle + endAngle) / 2;

  // Ensure angles are within 0 to 2π
  midAngle = (midAngle + 2 * Math.PI) % (2 * Math.PI);

  // Compute the lengths of the semi-major and semi-minor axes
  const a = Math.hypot(focus.x, focus.y);
  const b = a * axisRatio;

  // Compute the angle of rotation of the ellipse
  const rotation = Math.atan2(focus.y, focus.x);

  // Calculate the point on the ellipse at midAngle
  const cosMidAngle = Math.cos(midAngle);
  const sinMidAngle = Math.sin(midAngle);

  const x =
    center.x +
    a * cosMidAngle * Math.cos(rotation) -
    b * sinMidAngle * Math.sin(rotation);
  const y =
    center.y +
    a * cosMidAngle * Math.sin(rotation) +
    b * sinMidAngle * Math.cos(rotation);

  return { x, y };
}

// TODO
// export function transformEllipse(ellipse: EllipseProperties, matrix: number[]): EllipseProperties {
//   // function transformEllipse(cx, cy, radiusX, radiusY, rotation, matrix) {

//     // Transform the center point of the ellipse
//     const center: PointProperties = {
//       x: ellipse.x,
//       y: ellipse.y
//     }
//     const transformedCenter = transformPoint(center, matrix);

//     // Vectors representing the ellipse's axes before rotation
//     const ux = radiusX * Math.cos(rotation);
//     const uy = radiusX * Math.sin(rotation);
//     const vx = -radiusY * Math.sin(rotation);
//     const vy = radiusY * Math.cos(rotation);

//     // Extract linear transformation components from the matrix
//     const a = matrix[0], b = matrix[1];
//     const d = matrix[3], e = matrix[4];

//     // Transform the axes vectors
//     const transformedUx = {
//         x: a * ux + b * uy,
//         y: d * ux + e * uy
//     };
//     const transformedVy = {
//         x: a * vx + b * vy,
//         y: d * vx + e * vy
//     };

//     // Compute the lengths of the transformed axes (semi-major and semi-minor)
//     const newRadiusX = Math.hypot(transformedUx.x, transformedUx.y);
//     const newRadiusY = Math.hypot(transformedVy.x, transformedVy.y);

//     // Compute the rotation angle of the transformed ellipse
//     const newRotation = Math.atan2(transformedUx.y, transformedUx.x);

//     // Return the transformed ellipse parameters
//     return {
//         x: transformedCenter.x,
//         y: transformedCenter.y,
//         radiusX: newRadiusX,
//         radiusY: newRadiusY,
//         rotation: newRotation
//     };
// }
