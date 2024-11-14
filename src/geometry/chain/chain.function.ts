import { Chain } from "./chain";
import { DirectionEnum, GeometryTypeEnum } from "../geometry.enum";
import { PointProperties } from "../point/point";
import { Shape } from "../shape";
import { segmentIntersects } from "../segment/segment.function";
import { arcToPoints } from "../arc/arc.function";
import { cubicCurveToPoints } from "../cubic-curve/cubic-curve.function";
import { quadraticCurveToPoints } from "../quadratic-curve/quadratic-curve.function";
import { Arc } from "../arc/arc";
import { CubicCurve } from "../cubic-curve/cubic-curve";
import { QuadraticCurve } from "../quadratic-curve/quadratic-curve";
import { circleToPoints } from "../circle/circle.function";
import { Circle } from "../circle/circle";
import { Rectangle } from "../rectangle/rectangle";

export function sortShapesInDirection(
  shapes: Shape[],
  direction: DirectionEnum,
): Shape[] {
  // Function to generate a key for a point with rounding to handle floating point inaccuracies
  function getPointKey(point) {
    const x = point.x.toFixed(6);
    const y = point.y.toFixed(6);
    return `${x},${y}`;
  }

  // Step 1: Collect unique points and calculate centroid
  const pointMap = new Map();
  let sumX = 0;
  let sumY = 0;
  shapes.forEach((shape) => {
    [shape.startPoint, shape.endPoint].forEach((point) => {
      const key = getPointKey(point);
      if (!pointMap.has(key)) {
        pointMap.set(key, { point, key });
        sumX += point.x;
        sumY += point.y;
      }
    });
  });
  const points = Array.from(pointMap.values());
  const centroidX = sumX / pointMap.size;
  const centroidY = sumY / pointMap.size;

  // Step 2: Compute angles for each point
  points.forEach((p) => {
    p.angle = Math.atan2(p.point.y - centroidY, p.point.x - centroidX);
  });

  // Step 3: Sort points based on angle
  points.sort((a, b) => {
    if (direction === DirectionEnum.CW) {
      return b.angle - a.angle;
    } else {
      return a.angle - b.angle;
    }
  });

  // Step 4: Map shapes between points
  const shapeMap = new Map();
  shapes.forEach((shape) => {
    const startKey = getPointKey(shape.startPoint);
    const endKey = getPointKey(shape.endPoint);
    const keyForward = `${startKey}->${endKey}`;
    const keyBackward = `${endKey}->${startKey}`;
    shapeMap.set(keyForward, { shape, reverse: false });
    shapeMap.set(keyBackward, { shape, reverse: true });
  });

  // Step 5: Build sorted list of shapes
  const sortedShapes = [];
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const pointA = points[i];
    const pointB = points[(i + 1) % n]; // Wrap around to form a loop
    const keyAB = `${pointA.key}->${pointB.key}`;
    const keyBA = `${pointB.key}->${pointA.key}`;
    if (shapeMap.has(keyAB)) {
      const { shape } = shapeMap.get(keyAB);
      sortedShapes.push(shape);
    } else if (shapeMap.has(keyBA)) {
      const { shape } = shapeMap.get(keyBA);
      // Reverse the shape to maintain direction
      const reversedShape = { start: shape.end, end: shape.start };
      sortedShapes.push(reversedShape);
    } else {
      throw new Error(
        `No shape connects point ${pointA.key} to point ${pointB.key}`,
      );
    }
  }

  return sortedShapes;
}

/** Returns true if, starting with first shape, each subsequent shape is connected end-to-start point */
export function chainIsClosed(chain: Chain): boolean {
  let last_shape: Shape;
  for (let shape of this.children) {
    if (last_shape) {
      if (last_shape.endPoint.isEqual(shape.startPoint)) {
        // good result
      } else {
        // bad result
        return false;
      }
    }
    last_shape = shape;
  }
  return true;
}

export function chainBoundingBox(chain: Chain): Rectangle {
  const boundary = new Rectangle({startPoint:{x:0,y:0}, endPoint: {x:0,y:0}});
  chain.children.forEach((shape) => boundary.join(shape.boundary));
  return boundary;
}

/**
 * Point-in-polygon test using ray casting algorithm
 * 
 * @param point 
 * @param polygon 
 * @param edgeEnclosed If true, points on polygon edge are considered enclosed. Otherwise, they are not.
 * @returns 
 */
function pointEnclosedByPolygon(point: PointProperties, polygon: PointProperties[], edgeEnclosed: boolean = false) {
    let crossings = 0;
    for (let i = 0; i < polygon.length - 1; i++) {
        const a = polygon[i];
        const b = polygon[i + 1];

        // Check if point lies exactly on the edge
        const minX = Math.min(a.x, b.x);
        const maxX = Math.max(a.x, b.x);
        const minY = Math.min(a.y, b.y);
        const maxY = Math.max(a.y, b.y);
        const onEdge =
            ((b.y - a.y) * (point.x - a.x) - (b.x - a.x) * (point.y - a.y) === 0) &&
            point.x >= minX &&
            point.x <= maxX &&
            point.y >= minY &&
            point.y <= maxY;
        if (!edgeEnclosed && onEdge) {
            return false; // Consider point on the edge as outside
        } else if (edgeEnclosed && onEdge) {
            return true; // Consider point on the edge as inside
        }

        // Ray casting logic
        if ((a.y > point.y) !== (b.y > point.y)) {
            const atX = ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
            if (point.x < atX) {
                crossings++;
            }
        }
    }
    return crossings % 2 !== 0;
}

// Function to check for intersections between two chains
function chainsIntersect(chainA: PointProperties[], chainB: PointProperties[]) {
    for (let i = 0; i < chainA.length - 1; i++) {
        const a1 = chainA[i];
        const a2 = chainA[i + 1];
        for (let j = 0; j < chainB.length - 1; j++) {
            const b1 = chainB[j];
            const b2 = chainB[j + 1];
            if (segmentIntersects(a1, a2, b1, b2)) {
                return true;
            }
        }
    }
    return false;
}

// Determine if Chain A is enclosed by Chain B
export function chainContains(outer: Chain, inner: Chain) {
    // Approximate curves in chains to polylines
    const innerPoints: PointProperties[] = [];
    inner.children.forEach((shape: Shape) => {
        if (shape.type === GeometryTypeEnum.SEGMENT) {
            innerPoints.push(shape.startPoint, shape.endPoint);
            // TODO handle Points
            // } else if (shape.type === GeometryTypeEnum.POINT) {
            //     chainAPoints.push(shape.point);
        } else if (shape.type === GeometryTypeEnum.ARC) {
            innerPoints.push(...arcToPoints(shape as Arc));
        } else if (shape.type === GeometryTypeEnum.CUBIC_CURVE) {
            innerPoints.push(...cubicCurveToPoints(shape as CubicCurve));
        } else if (shape.type === GeometryTypeEnum.QUADRATIC_CURVE) {
            innerPoints.push(...quadraticCurveToPoints(shape as QuadraticCurve));
        } else if (shape.type === GeometryTypeEnum.CIRCLE) {
            innerPoints.push(...circleToPoints(shape as Circle));
        } else {
            throw new Error(`Unsupported geometry: ${shape.type}`);
        }
    });

    const outerPoints: PointProperties[] = [];
    outer.children.forEach((shape: Shape) => {
        if (shape.type === GeometryTypeEnum.SEGMENT) {
            outerPoints.push(shape.startPoint, shape.endPoint);
            // TODO handle Points
            // } else if (shape.type === GeometryTypeEnum.POINT) {
            //     chainBPoints.push(shape.point);
        } else if (shape.type === GeometryTypeEnum.ARC) {
            outerPoints.push(...arcToPoints(shape as Arc));
        } else if (shape.type === GeometryTypeEnum.CUBIC_CURVE) {
            outerPoints.push(...cubicCurveToPoints(shape as CubicCurve));
        } else if (shape.type === GeometryTypeEnum.QUADRATIC_CURVE) {
            outerPoints.push(...quadraticCurveToPoints(shape as QuadraticCurve));
        } else if (shape.type === GeometryTypeEnum.CIRCLE) {
            outerPoints.push(...circleToPoints(shape as Circle));
        } else {
            throw new Error(`Unsupported geometry: ${shape.type}`);
        }
    });

    // Ensure chains are closed
    // TODO refactor into its own function
    if (
        outerPoints[0].x !== outerPoints[outerPoints.length - 1].x ||
        outerPoints[0].y !== outerPoints[outerPoints.length - 1].y
    ) {
        outerPoints.push(outerPoints[0]);
    }

    // Step 1: Check for intersections
    if (chainsIntersect(innerPoints, outerPoints)) {
        return false;
    }

    // Step 2: Check if all points in Chain A are inside Chain B
    for (let i = 0; i < innerPoints.length; i += 5) {
        const point = innerPoints[i];
        if (!pointEnclosedByPolygon(point, outerPoints)) {
            return false;
        }
    }

    return true;
}

export function chainStartPoint(chain: Chain): PointProperties {
  return chain.children[0].startPoint;
}

export function chainEndPoint(chain: Chain): PointProperties {
  return chain.children[chain.children.length - 1].endPoint  
}