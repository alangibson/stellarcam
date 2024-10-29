import { Arc } from "../geometry/arc";
import { Point } from "../geometry/point";

/**
 * Converts a DXF LWPOLYLINE bulge to an arc (center, radius, start angle, end angle).
 *
 * @param {number[]} startPoint - [x1, y1] coordinates of the start point of the segment.
 * @param {number[]} endPoint - [x2, y2] coordinates of the end point of the segment.
 * @param {number} bulge - The bulge value of the polyline segment.
 * @returns {object} Arc information with center, radius, start angle, end angle (in radians).
 */
export function dxfBulgeToArc(startPoint: Point, endPoint: Point, bulge: number): Arc {
    const [x1, y1] = [startPoint.x, startPoint.y];
    const [x2, y2] = [endPoint.x, endPoint.y];

    // console.log(`bulgeToArc. ${bulge} ${startPoint.x},${startPoint.y} ${endPoint.x},${endPoint.y}`);
    // Calculate the distance between start and end points (chord length)
    const chordLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    // console.log(`  chordLength: ${chordLength}`);
    // Calculate the included angle (in radians) from the bulge
    const includedAngle = 4 * Math.atan(Math.abs(bulge));
    // console.log(`  includedAngle: ${includedAngle}`);
    // Calculate the radius of the arc (radius is always positive)
    const radius = chordLength / (2 * Math.sin(includedAngle / 2));
    // console.log(`  radius: ${radius}`);
    // Midpoint of the chord
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    // console.log(`  mid: ${midX},${midY}`);
    // Perpendicular distance from the midpoint to the arc center
    const perpendicularDistance = radius * Math.cos(includedAngle / 2);
    // console.log(`  perpendicularDistance: ${perpendicularDistance}`);
    // Calculate the direction of the bulge (positive or negative determines arc direction)
    const dirX = -(y2 - y1) / chordLength; // Perpendicular direction X
    const dirY = (x2 - x1) / chordLength; // Perpendicular direction Y

    // console.log(`  dir: ${dirX},${dirY}`);
    // Calculate the center of the arc (bulge sign affects direction)
    const centerX = midX + dirX * perpendicularDistance * Math.sign(bulge);
    const centerY = midY + dirY * perpendicularDistance * Math.sign(bulge);
    // console.log(`  center: ${centerX},${centerY}`);
    // Calculate the start and end angles relative to the arc's center
    let startAngle = Math.atan2(y1 - centerY, x1 - centerX);
    let endAngle = Math.atan2(y2 - centerY, x2 - centerX);
    // For negative bulges, the arc is drawn clockwise, so we swap start and end angles
    if (bulge < 0) {
        [startAngle, endAngle] = [endAngle, startAngle];
    }
    // console.log(`  startAngle: ${startAngle}, endAngle: ${endAngle}`);
    return new Arc({
        center: new Point({ x: centerX, y: centerY }),
        radius: radius,
        start_angle: startAngle,
        end_angle: endAngle
    });
}
