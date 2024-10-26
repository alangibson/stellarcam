import { Point } from "./point";

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
        bottomRight: new Point({ x: x2, y: y2 })
    };
}

// https://stackoverflow.com/a/27905268
export function circlePath(center: Point, radius: number) {
    return 'M ' + center.x + ' ' + center.y + ' m -' + radius + ', 0 a ' + radius + ',' + radius + ' 0 1,1 ' + (radius * 2) + ',0 a ' + radius + ',' + radius + ' 0 1,1 -' + (radius * 2) + ',0';
}

/** Return a point at a distance along a circle */
export function pointAlongCircle(cx, cy, r, start_x, start_y, distance, clockwise: boolean = true) {
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