import { Chain } from "../../domain/chain";
import { GeometryTypeEnum } from "../geometry.enum";
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
