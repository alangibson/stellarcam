import { QuadraticCurveProperties } from "../../geometry/quadratic-curve";
import { Point } from "../../geometry/point";
import { CubicCurveProperties } from "../../geometry/cubic-curve";

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
export function arcToCubicCurve(cx, cy, rx, ry, startAngle, endAngle, rotationAngle): CubicCurveProperties {
    const theta = (endAngle - startAngle) / 2;
    const alpha = Math.sin(theta) * (Math.sqrt(4 + 3 * Math.pow(Math.tan(theta), 2)) - 1) / 3;

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
        start_point: start,
        control1,
        control2,
        end_point: end
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
export function ellipseToCubicCurves(cx, cy, fx, fy, axisRatio, startAngle, endAngle): CubicCurveProperties[] {
    const curves = [];
    const step = Math.PI / 2; // Split the ellipse into segments (quarter arcs)

    // Adjust ry based on the axis ratio
    fy = fx * axisRatio;

    const rotationAngle: number = ellipseRotation(cx, cy, fx, fy);
    // const rotationAngle = 0;

    // Determine if the ellipse should be closed
    const isClosed = ellipseIsClosed(startAngle, endAngle);

    // Loop through segments and approximate each with a Bézier curve
    for (let angle = startAngle; angle < endAngle; angle += step) {
        const segmentEnd = Math.min(angle + step, endAngle);
        const bezierCurve = arcToCubicCurve(cx, cy, fx, fy, angle, segmentEnd, rotationAngle);
        curves.push(bezierCurve);
    }

    // If the ellipse is closed and spans 2π, add an extra segment to close the shape
    if (isClosed && startAngle !== endAngle) {
        const closingCurve = arcToCubicCurve(cx, cy, fx, fy, endAngle, startAngle, rotationAngle);
        curves.push(closingCurve);
    }

    return curves;
}
