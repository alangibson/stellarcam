import { DirectionEnum } from "../geometry.enum";
import { Point, PointProperties } from "../point/point";
import { transformPoint } from "../point/point.function";
import { QuadraticCurveProperties } from "./quadratic-curve";

export function quadraticBezierBoundingBox(p0: Point, p1: Point, p2: Point) {
  // Function to evaluate the quadratic Bezier curve at a given t
  function bezier(t) {
    const x =
      Math.pow(1 - t, 2) * p0.x +
      2 * (1 - t) * t * p1.x +
      Math.pow(t, 2) * p2.x;

    const y =
      Math.pow(1 - t, 2) * p0.y +
      2 * (1 - t) * t * p1.y +
      Math.pow(t, 2) * p2.y;

    return [x, y];
  }

  // Initialize bounding box coordinates
  let minX = Math.min(p0.x, p1.x, p2.x);
  let maxX = Math.max(p0.x, p1.x, p2.x);
  let minY = Math.min(p0.y, p1.y, p2.y);
  let maxY = Math.max(p0.y, p1.y, p2.y);

  // Check for critical points
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

export function cubicBezierOrientation(P0, P1, P2, P3): DirectionEnum {
  // Calculate the direction vectors
  const v1 = { x: P1.x - P0.x, y: P1.y - P0.y };
  const v2 = { x: P3.x - P2.x, y: P3.y - P2.y };

  // Calculate the cross product of v1 and v2
  const crossProduct = v1.x * v2.y - v1.y * v2.x;

  // Determine orientation
  if (crossProduct > 0) {
    return DirectionEnum.CCW;
  } else if (crossProduct < 0) {
    return DirectionEnum.CW;
  } else {
    console.log("Collinear or Straight Line");
  }
}

export function quadraticBezierOrientation(P0, P1, P2): DirectionEnum {
  // Calculate direction vectors
  const v1 = { x: P1.x - P0.x, y: P1.y - P0.y };
  const v2 = { x: P2.x - P1.x, y: P2.y - P1.y };

  // Calculate the cross product of v1 and v2
  const crossProduct = v1.x * v2.y - v1.y * v2.x;

  // Determine orientation
  if (crossProduct > 0) {
    return DirectionEnum.CCW;
  } else if (crossProduct < 0) {
    return DirectionEnum.CW;
  } else {
    console.log("Collinear or Straight Line");
  }
}

export function quadraticBezierMidpoint(P0: Point, P1: Point, P2: Point) {
  // Calculate midpoint coordinates using the Bézier formula for t = 0.5
  const midX =
    (1 - 0.5) ** 2 * P0.x + 2 * (1 - 0.5) * 0.5 * P1.x + 0.5 ** 2 * P2.x;
  const midY =
    (1 - 0.5) ** 2 * P0.y + 2 * (1 - 0.5) * 0.5 * P1.y + 0.5 ** 2 * P2.y;

  return new Point({ x: midX, y: midY });
}

export function pointAlongQuadraticBezier(x0, y0, x1, y1, x2, y2, distance) {
  // Function to compute the point on the quadratic Bézier curve at parameter t
  function getPoint(t) {
    const mt = 1 - t;
    const x = mt * mt * x0 + 2 * mt * t * x1 + t * t * x2;
    const y = mt * mt * y0 + 2 * mt * t * y1 + t * t * y2;
    return { x, y };
  }

  // Approximate the total length of the curve
  const N = 100; // Number of segments (higher for better accuracy)
  let length = 0;
  const lengths = [0]; // Cumulative lengths
  let prevPoint = { x: x0, y: y0 };

  for (let i = 1; i <= N; i++) {
    const t = i / N;
    const currentPoint = getPoint(t);

    const dx = currentPoint.x - prevPoint.x;
    const dy = currentPoint.y - prevPoint.y;
    const segmentLength = Math.hypot(dx, dy);

    length += segmentLength;
    lengths.push(length);

    prevPoint = currentPoint;
  }

  // Clamp the distance to the total length of the curve
  if (distance <= 0) return { x: x0, y: y0 };
  if (distance >= length) return { x: x2, y: y2 };

  // Use binary search to find the segment where the distance falls
  let low = 0;
  let high = N;
  let index = 0;

  while (low <= high) {
    index = Math.floor((low + high) / 2);
    if (lengths[index] < distance) {
      low = index + 1;
    } else {
      high = index - 1;
    }
  }

  // Interpolate between the two surrounding points to get a more precise t
  const t0 = (index - 1) / N;
  const t1 = index / N;
  const l0 = lengths[index - 1];
  const l1 = lengths[index];

  // Avoid division by zero
  const segmentLength = l1 - l0 || 1e-6;
  const t = t0 + ((distance - l0) / segmentLength) * (t1 - t0);

  // Compute the point at parameter t
  return getPoint(t);
}

/** Tranform quadratic curve with 3x3 transform matrix */
export function transformQuadraticCurve(curve: QuadraticCurveProperties, matrix: number[]): QuadraticCurveProperties {
  return {
    startPoint: transformPoint(curve.startPoint, matrix),
    control1: transformPoint(curve.control1, matrix),
    endPoint: transformPoint(curve.endPoint, matrix)
  };
}

export function offsetQuadraticCurve(curve: QuadraticCurveProperties, distance: number, samples: number = 100) {
  var innerOffsetPoints: PointProperties[] = [];
  var outerOffsetPoints: PointProperties[] = [];

  for (var i = 0; i <= samples; i++) {
      var t = i / samples;

      // Compute point on the curve B(t)
      var Bx = Math.pow(1 - t, 2) * curve.startPoint.x + 2 * (1 - t) * t * curve.control1.x + Math.pow(t, 2) * curve.endPoint.x;
      var By = Math.pow(1 - t, 2) * curve.startPoint.y + 2 * (1 - t) * t * curve.control1.y + Math.pow(t, 2) * curve.endPoint.y;

      // Compute derivative B'(t)
      var Bdx = 2 * (1 - t) * (curve.control1.x - curve.startPoint.x) + 2 * t * (curve.endPoint.x - curve.control1.x);
      var Bdy = 2 * (1 - t) * (curve.control1.y - curve.startPoint.y) + 2 * t * (curve.endPoint.y - curve.control1.y);

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

  return {
      inner: innerOffsetPoints,
      outer: outerOffsetPoints
  };
}
