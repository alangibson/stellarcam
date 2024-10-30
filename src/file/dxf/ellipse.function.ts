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



// Convert an arc segment of an ellipse to a cubic Bézier curve
export function arcToCubicCurve(cx, cy, rx, ry, startAngle, endAngle): CubicCurveProperties {
    const theta = (endAngle - startAngle) / 2;
    const alpha = Math.sin(theta) * (Math.sqrt(4 + 3 * Math.pow(Math.tan(theta), 2)) - 1) / 3;

    const x1 = Math.cos(startAngle);
    const y1 = Math.sin(startAngle);
    const x2 = Math.cos(endAngle);
    const y2 = Math.sin(endAngle);

    const start = {
        x: cx + rx * x1,
        y: cy + ry * y1
    };
    const end = {
        x: cx + rx * x2,
        y: cy + ry * y2
    };

    const control1 = {
        x: start.x + alpha * rx * -y1,
        y: start.y + alpha * ry * x1
    };
    const control2 = {
        x: end.x + alpha * rx * y2,
        y: end.y + alpha * ry * -x2
    };

    return {
        start_point: start,
        control1,
        control2,
        end_point: end
    };
}

// Convert an ellipse to multiple cubic Bézier curves
export function ellipseToCubicCurves(cx, cy, rx, ry, axisRatio, startAngle, endAngle): CubicCurveProperties[] {
    const curves = [];
    const step = Math.PI / 2; // Split the ellipse into segments (quarter arcs)

    // Adjust ry based on the axis ratio
    ry = rx * axisRatio;

    // Determine if the ellipse should be closed
    const isClosed = ellipseIsClosed(startAngle, endAngle);

    // Loop through segments and approximate each with a Bézier curve
    for (let angle = startAngle; angle < endAngle; angle += step) {
        const segmentEnd = Math.min(angle + step, endAngle);
        const bezierCurve = arcToCubicCurve(cx, cy, rx, ry, angle, segmentEnd);
        curves.push(bezierCurve);
    }

    // If the ellipse is closed and spans 2π, add an extra segment to close the shape
    if (isClosed && startAngle !== endAngle) {
        const closingCurve = arcToCubicCurve(cx, cy, rx, ry, endAngle, startAngle);
        curves.push(closingCurve);
    }

    return curves;
}








/** Estimate the number of segments we need to approximate the ellipse with curves */
export function estimateSegmentCount(xAxis, yAxis, angleRange, maxError = 0.5) {
    const avgAxis = (xAxis + yAxis) / 2;
    return Math.max(2, Math.ceil(angleRange / (Math.acos(1 - (maxError / avgAxis)) * (180 / Math.PI))));
}

/**
 * 
 * @param cx Center coordinates of the ellipse.
 * @param cy Center coordinates of the ellipse.
 * @param majorX Semi-major and semi-minor axes (widths) of the ellipse.
 * @param majorY Semi-major and semi-minor axes (widths) of the ellipse.
 * @param axisRatio  Ratio of the minor axis to the major axis.
 * @param startAngle Angles in degrees to define the start and end points of the arc.
 * @param endAngle Angles in degrees to define the start and end points of the arc.
 * @param segments Number of segments to split the arc into.
 * @returns Array of Curves
 */
export function ellipseToQuadraticCurves(cx, cy, majorX, majorY, axisRatio, startAngle, endAngle): QuadraticCurveProperties[] {
    const curves: QuadraticCurveProperties[] = [];
    const angleRange = ellipseAngleRange(startAngle, endAngle);

    // Adjust majorY according to the ratio
    majorY *= axisRatio;

    // Calculate the number of segments using the helper function
    let segments = estimateSegmentCount(majorX, majorY, angleRange);

    const angleDiff = angleRange / segments;

    // Helper function to get a point on the ellipse at a given angle
    function getPointOnEllipse(angle) {
        const rad = angle * (Math.PI / 180); // Convert degrees to radians
        return {
            x: cx + majorX * Math.cos(rad),
            y: cy + majorY * Math.sin(rad)
        };
    }

    for (let i = 0; i < segments; i++) {
        const angle1 = startAngle + i * angleDiff;
        const angle2 = angle1 + angleDiff;

        const p0 = getPointOnEllipse(angle1);
        const p2 = getPointOnEllipse(angle2);

        // Calculate midpoint for the control point
        const midAngle = (angle1 + angle2) / 2;
        const cp = getPointOnEllipse(midAngle);

        curves.push({ control_points: [new Point(p0), new Point(cp), new Point(p2)], knots: [] });
    }

    return curves;
}